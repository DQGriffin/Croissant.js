import { useState } from "react";
import ExtensionIsolator from "../../../../helpers/ExtensionIsolator";
import { Extension } from "../../../../models/Extension";
import { CustomRule, CustomRuleCalledNumber, CustomRuleCaller, CustomRuleData } from "../models/CustomRule";

const useReadCustomRules = () => {
    const [customRules, setCustomRules] = useState<CustomRule[]>([])
    const [isRuleReadPending, setIsRuleReadPending] = useState(true)
    const callHandlingActionMap = new Map<string, string>([
        ['Transfer to Extension', 'TransferToExtension'],
        ['Transfer to External', 'UnconditionalForwarding'],
        ['Send to Voicemail', 'TakeMessagesOnly'],
        ['Play Message and Disconnect', 'PlayAnnouncementOnly'],
    ])

    const readCustomRules = (excelData: any, extensionsList: Extension[]) => {
        const rules: CustomRule[] = []
        const isolator = new ExtensionIsolator()

        for (const data of excelData) {
            const extension = extensionsList.find((extension) => `${extension.data.extensionNumber}` === `${data['Ext Number']}`)
            if (!extension) {
                // Bruh
                continue
            }

            let voicemailRecipientID = getVoicemailRecipient(data, extension, extensionsList)
            const transferExtensionID = getTransferExtensionID(`${data['Transfer Extension']}`, extensionsList)

            const ruleData: CustomRuleData = {
                name: data['Rule Name'],
                type: 'Custom',
                enabled: data['Enabled'] === 'Yes',
                callers: getCallers(data['Caller ID']),
                calledNumbers: getCalledNumbers(data['Called Number']),
                schedule: [],
                ranges: [],
                ref: "",
                callHandlingAction: callHandlingActionMap.get(data['Action']) || '',
                voicemail: {
                    enabled: data['Action'] === 'Send to Voicemail',
                    recipient: {id: parseInt(voicemailRecipientID)}
                },
                transfer: {
                    extension: {
                        id: transferExtensionID,
                    }
                },
                unconditionalForwarding: {
                    phoneNumber: getTransferPhoneNumber(`${data['Extermal Number']}`)
                }
            }
            const rule = new CustomRule(extension, ruleData)
            rules.push(rule)
        }
        setCustomRules(rules)
        setIsRuleReadPending(false)
    }

    const getVoicemailRecipient = (data: any, extension: Extension, extensionsList: Extension[]) => {
        const isolator = new ExtensionIsolator()
        let voicemailRecipientID = ''

        if (data['Voicemail Recipient']) {
            const extractedExtension = isolator.isolateExtension(data['Voicemail Recipient'])
            const voicemailRecipient = extensionsList.find((extension) => `${extension.data.extensionNumber}` === extractedExtension)

            if (voicemailRecipient) {
                voicemailRecipientID = `${voicemailRecipient.data.id}`
            }
            else {
                console.log(`Voicemail recipient not found. Setting to ${extension.data.id}`)
                voicemailRecipientID = `${extension.data.id}`
            }
        }
        else {
            console.log(`Voicemail recipient not found. Setting to ${extension.data.id}`)
            voicemailRecipientID = `${extension.data.id}`
        }
        
        return voicemailRecipientID
    }

    const getCallers = (rawCallers: string) => {
        if (!rawCallers || rawCallers === '') return []

        const callers: CustomRuleCaller[] = []
        const callerList = rawCallers.split(',')

        for (const caller of callerList) {
            callers.push({
                callerId: caller
            })
        }

        return callers
    }

    const getCalledNumbers = (rawCalledNumbers: string) => {
        if (!rawCalledNumbers || rawCalledNumbers === '') return []

        const calledNumbers: CustomRuleCalledNumber[] = []
        const calledNumberList = rawCalledNumbers.split(',')

        for (const calledNumber of calledNumberList) {
            const numberData: CustomRuleCalledNumber = {
                phoneNumber: calledNumber
            }
            calledNumbers.push(numberData)
        }

        return calledNumbers
    }

    const getTransferExtensionID = (rawTransferExtension: string, extensionsList: Extension[]) => {
        if (!rawTransferExtension || rawTransferExtension === '') return ''

        const isolator = new ExtensionIsolator()
        const extensionNumber = isolator.isolateExtension(rawTransferExtension)

        const extension = extensionsList.find((extension) => `${extension.data.extensionNumber}` === `${extensionNumber}`)
        if (!extension) return ''

        return `${extension.data.id}`
    }

    const getTransferPhoneNumber = (rawPhoneNumber: string) => {
        console.log(`Raw phone number: ${rawPhoneNumber}`)
        if (!rawPhoneNumber || rawPhoneNumber === '') return ''

        const isolator = new ExtensionIsolator()
        const phoneNumber = isolator.isolatePhoneNumber(rawPhoneNumber)

        return phoneNumber ?? ''
    }

    return {readCustomRules, customRules, isRuleReadPending}
}

export default useReadCustomRules