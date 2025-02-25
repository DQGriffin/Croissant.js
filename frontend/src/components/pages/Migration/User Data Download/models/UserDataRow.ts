import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { BlockedCallSettings, BlockedPhoneNumber, BusinessHours, CallerID, CallHandling, DefaultBridge, Delegate, Device, PERL, ForwardAllCalls, IncommingCallInfo, IntercomStatus, Notifications, PresenseAllowedUser, PresenseLine, PresenseSettings, Role, PhoneNumber, IntercomUser, CustomRule } from "./UserDataBundle";

export class UserDataRow implements ExcelFormattable {

    public extensions: Extension[] = []

    constructor(public extension: Extension, public type: string, public device?: Device, public directNumber?: string, 
                public businessHoursCallHandling?: CallHandling, public afterHoursCallHandling?: CallHandling,
                public notifications?: Notifications, public callerID?: CallerID, public blockedCallSettings?: BlockedCallSettings,
                public blockedPhoneNumbers?: BlockedPhoneNumber[], public presenseLines?: PresenseLine[], public presenseSettings?: PresenseSettings,
                public presenseAllowedUsers?: PresenseAllowedUser[], public intercomStatus?: IntercomStatus, public delegates?: Delegate[], public erls?: PERL[],
                public roles?: Role[], public incommingCallInfo?: IncommingCallInfo, public businessHours?: BusinessHours, public forwardAllCalls?: ForwardAllCalls,
                public defaultBridge?: DefaultBridge, public userGroups?: string, public phoneNumberMap?: Map<string, PhoneNumber>, public tempExtension?: string, public intercomUsers?: IntercomUser[],
                public customRules?: CustomRule[]) {}

    toExcelRow(): string[] {
        return [
            '', // Initial upon completion
            this.type,
            this.extension.data.extensionNumber,
            this.tempExtension ?? '', // Temporary extension
            this.extension.data.contact.firstName,
            this.extension.data.contact.lastName ?? '',
            this.extension.data.contact.email,
            this.extension.data.contact.department ?? '',
            this.extension.data.contact.jobTitle ?? '',
            this.userGroups ?? '', // User groups
            this.extension.data.contact.businessPhone ?? '',
            this.extension.data.contact.mobilePhone ?? '',
            this.extension.data.regionalSettings?.timezone.description ?? '',
            this.extension.data.regionalSettings?.formattingLocale.name ?? '',
            this.extension.data.regionalSettings?.language.name ?? '',
            this.extension.data.regionalSettings?.timeFormat ?? '',
            this.prettyBusinessHours(),
            this.roles?.at(0)?.displayName ?? '',
            !this.extension.data.hidden ? 'ON' : 'OFF',
            this.extension.data.site?.name ?? '',
            this.getPhoneNumber(),
            this.getTempPhoneNumber(),
            this.device ? this.device?.model?.name ?? 'RingCentral Phone App' : '',
            this.device?.serial ?? '',
            this.device?.name ?? '',
            '', // Default area code
            this.device?.emergencyServiceAddress?.customerName ?? '',
            this.device?.emergencyServiceAddress?.street ?? '',
            this.device?.emergencyServiceAddress?.street2 ?? '',
            this.device?.emergencyServiceAddress?.city ?? '',
            this.device?.emergencyServiceAddress?.stateName ?? '',
            this.device?.emergencyServiceAddress?.zip ?? '',
            this.device?.emergencyServiceAddress?.countryName ?? '',
            '', // Device locked?
            '', // WMI
            this.prettyPresenseLines(),
            this.presenseSettings?.ringOnMonitoredCall === true ? 'ON' : 'OFF',
            this.presenseSettings?.pickUpCallsOnHold === true ? 'ON' : 'OFF',
            this.presenseSettings?.allowSeeMyPresence === true ? 'ON' : 'OFF',
            this.prettyPresenseUsers(),
            this.intercomStatus?.enabled ? 'ON' : 'OFF',
            this.prettyIntercomUsers(),
            this.prettyDelegates(),
            this.defaultBridge?.pins.web ?? '',
            this.greeting('Introductory'),
            this.businessHoursCallHandling?.screening ?? '',
            this.greeting('ConnectingMessage'),
            this.greeting('ConnectingAudio'),
            this.greeting('HoldMusic'),
            this.afterHoursGreeting('Introductory'),
            this.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.afterHoursCallHandling?.screening ?? '' : '',
            this.afterHoursGreeting('ConnectingMessage'),
            this.afterHoursGreeting('ConnectingAudio'),
            this.afterHoursGreeting('HoldMusic'),
            this.blockedCallSettings?.mode ?? '',
            this.blockedPhoneNumbers?.map((number) => `${number.label ?? '[No label]'} - ${number.phoneNumber}`).join('\n') ?? '',
            this.blockedCallSettings?.noCallerId ?? '',
            this.blockedCallSettings?.payPhones ?? '',
            this.prettyForwardAllCalls(),
            this.businessHoursCallHandling?.forwarding?.ringingMode ?? '',
            this.businessHoursCallHandling?.forwarding?.softPhonesAlwaysRing ? 'Always Ring' : this.prettyRingTime(this.businessHoursCallHandling?.forwarding?.softPhonesRingCount),
            this.prettyDeviceRingTime(),
            this.prettyVoicemailAction(),
            this.greeting('Voicemail'),
            this.businessHoursCallHandling?.voicemail?.recipient.displayName ?? '',
            this.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.afterHoursCallHandling?.forwarding?.ringingMode ?? '' : '',
            this.afterHoursCallHandling?.callHandlingAction === 'ForwardCalls' ? this.prettyRingTime(this.afterHoursCallHandling?.forwarding?.softPhonesRingCount) : '',
            this.prettyAfterHoursDeviceRingTime(),
            this.prettyAfterHoursVoicemailAction(),
            this.afterHoursGreeting('Voicemail'),
            this.afterHoursCallHandling?.voicemail?.recipient.displayName ?? '',
            this.prettyCustomRules(), // Custom roles
            this.prettyIncommingCallInfo(),
            this.notifications?.voicemails.includeTranscription ? 'ON' : 'OFF',
            this.prettyPERLs(),
            this.notifications?.emailAddresses?.join('\n') ?? '',
            this.notifications?.voicemails.advancedEmailAddresses?.join(', ') ?? '',
            this.notifications?.inboundFaxes.advancedEmailAddresses?.join(', ') ?? '',
            this.notifications?.outboundFaxes.advancedEmailAddresses?.join(', ') ?? '',
            this.notifications?.missedCalls.advancedEmailAddresses?.join(', ') ?? '',
            this.notifications?.inboundTexts.advancedEmailAddresses?.join(', ') ?? '',
            this.notifications?.smsEmailAddresses?.join(', ') ?? '',
            this.prettyVoicemailNotificationSettings(),
            this.prettyFaxNotificationSettings(),
            this.notifications?.missedCalls.notifyByEmail ? 'Notify' : 'Do not notify',
            this.notifications?.outboundFaxes.notifyByEmail ? 'Notify' : 'Do not notify',
            this.notifications?.inboundTexts.notifyByEmail ? 'Notify' : 'Do not notify',
            this.prettyDeviceCallerID(),
            this.callerIDNumber('FaxNumber'),
            this.callerIDNumber('CallFlip'),
            this.callerIDNumber('RingOut'),
            this.callerIDNumber('RingMe'),
            this.callerIDNumber('AdditionalSoftphone'),
            this.callerIDNumber('Alternate'),
            this.callerIDNumber('CommonPhone'),
            this.callerIDNumber('MobileApp'),
            this.callerIDNumber('Delegated'),
            this.extension.data.costCenter?.name ?? ''
        ]
    }

    getPhoneNumber() {
        if (this.directNumber) return this.directNumber
        if (this.device && this.device.phoneLines && this.device.phoneLines.length !== 0 && this.device.phoneLines[0].phoneInfo) return this.device.phoneLines[0].phoneInfo.phoneNumber
        return ''
    }

    getTempPhoneNumber() {
        if (this.directNumber) {
            const tempNumber = this.phoneNumberMap?.get(this.directNumber)
            if (!tempNumber) return ''
            return tempNumber.phoneNumber
        }
        if (this.device && this.device.phoneLines && this.device.phoneLines.length !== 0 && this.device.phoneLines[0].phoneInfo) {
            const tempNumber = this.phoneNumberMap?.get(this.device.phoneLines[0].phoneInfo.phoneNumber)
            if (!tempNumber) return ''
            return tempNumber.phoneNumber
        }
        return ''
    }

    greeting(name: string) {
        for (const greeting of this.businessHoursCallHandling?.greetings ?? []) {
            if (greeting.type === name) {
                if ('preset' in greeting) {
                    return greeting.preset.name    
                }
                else {
                    return 'Custom'
                }
            }
        }
        return ''
    }

    afterHoursGreeting(name: string) {
        if (this.afterHoursCallHandling?.callHandlingAction !== 'ForwardCalls') return ''

        for (const greeting of this.afterHoursCallHandling?.greetings ?? []) {
            if (greeting.type === name) {
                if ('preset' in greeting) {
                    return greeting.preset.name    
                }
                else {
                    return 'Custom'
                }
            }
        }
        return ''
    }

    prettyCustomRules() {
        if (!this.customRules || this.customRules.length === 0) return ''

        let result = ''

        for (let index = 0; index < this.customRules?.length; index++) {
            const rule = this.customRules[index]
            result += `Name: ${rule.name}\n\n`
            result += `Enabled: ${rule.enabled ? 'Yes' : 'No'}\n\n`

            if (rule.schedule) {
                result += 'Schedule:\n'
                result += `${this.prettyRuleHours(rule)}\n`
            }
            
            if (rule.calledNumbers) {
                result += 'Called Numbers:\n'
                for (const calledNumber of rule.calledNumbers) {
                    result += `${calledNumber.phoneNumber}\n`
                }
                result += '\n'
            }

            if (rule.callers) {
                result += 'Callers:\n'
                for (const caller of rule.callers) {
                    result += `${caller.name ?? ''} - ${caller.callerId}\n`
                }
                result += '\n'
            }

            result += 'Action:\n'
            result += `${this.prettyRuleAction(rule)}\n\n`

            result += '-----------------\n\n'
        }

        return result
    }

    prettyRuleAction(rule: CustomRule) {
        if (rule.callHandlingAction === 'UnconditionalForwarding' && rule.unconditionalForwarding) {
            return `Transfer to ${rule.unconditionalForwarding.phoneNumber}`
        }
        else if (rule.callHandlingAction === 'TransferToExtension' && rule.transfer) {
            const transferExtension = this.extensions.find((ext) => `${ext.data.id}` === `${rule.transfer?.extension.id}`)
            return `Transfer to ${transferExtension?.data.name} - Ext. ${transferExtension?.data.extensionNumber}`
        }
        else if (rule.callHandlingAction === 'TakeMessagesOnly' && rule.voicemail) {
            return `Send to Voicemail`
        }
        else if (rule.callHandlingAction) {
            return `Play Announcement`
        }

        return ''
    }

    prettyRuleHours(rule: CustomRule) {
        let result = ''

        if (!rule.schedule) return result
        if (rule.schedule.ref) return `${rule.schedule.ref}\n`
        if (Object.keys(rule.schedule).length === 0) return '24/7\n'

        if (rule.schedule.weeklyRanges) {
            const weeklyRanges = rule.schedule.weeklyRanges
            if (weeklyRanges.sunday) {
                result += `Sunday: ${this.convertTo12HourTime(weeklyRanges.sunday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.sunday[0].to)}\n`
            }
            if (weeklyRanges.monday) {
                result += `Monday: ${this.convertTo12HourTime(weeklyRanges.monday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.monday[0].to)}\n`
            }
            if (weeklyRanges.tuesday) {
                result += `Tuesday: ${this.convertTo12HourTime(weeklyRanges.tuesday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.tuesday[0].to)}\n`
            }
            if (weeklyRanges.wednesday) {
                result += `Wednesday: ${this.convertTo12HourTime(weeklyRanges.wednesday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.wednesday[0].to)}\n`
            }
            if (weeklyRanges.thursday) {
                result += `Thursday: ${this.convertTo12HourTime(weeklyRanges.thursday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.thursday[0].to)}\n`
            }
            if (weeklyRanges.friday) {
                result += `Friday: ${this.convertTo12HourTime(weeklyRanges.friday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.friday[0].to)}\n`
            }
            if (weeklyRanges.saturday) {
                result += `Saturday: ${this.convertTo12HourTime(weeklyRanges.saturday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.saturday[0].to)}\n`
            }
        }
        else if (rule.schedule.ranges) {
            result += '(Shown in GMT timezone)\n'
            for (const range of rule.schedule.ranges) {
                result += `${range.from} - ${range.to}\n`
            }
        }

        return result
    }

    prettyVoicemailAction() {
        if (!this.businessHoursCallHandling?.missedCall) return 'Send to Voicemail'

        let result = ''
        switch(this.businessHoursCallHandling.missedCall.actionType) {
            case 'PlayGreetingAndDisconnect':
                result = 'Play Announcement'
                break
            case 'ConnectToExtension':
                result = `Transfer to ${this.businessHoursCallHandling.missedCall.extension.displayName}`
                break
            case 'ConnectToExternalNumber':
                result = `Transfer to ${this.businessHoursCallHandling.missedCall.externalNumber.phoneNumber}`
                break
            default:
                result = ''
                break
        }
        return result
    }

    prettyAfterHoursVoicemailAction() {
        if (!this.afterHoursCallHandling?.missedCall) return 'Send to Voicemail'

        let result = ''
        switch(this.afterHoursCallHandling.missedCall.actionType) {
            case 'PlayGreetingAndDisconnect':
                result = 'Play Announcement'
                break
            case 'ConnectToExtension':
                result = `Transfer to ${this.afterHoursCallHandling.missedCall.extension.displayName}`
                break
            case 'ConnectToExternalNumber':
                result = `Transfer to ${this.afterHoursCallHandling.missedCall.externalNumber.phoneNumber}`
                break
            default:
                result = ''
        }
        return result
    }

    prettyPresenseLines() {
        if (!this.presenseLines) return ''

        let result = ''

        result += `Line ${1} - Ext. ${this.extension.data.extensionNumber}\n`
        result += `Line ${2} - Ext. ${this.extension.data.extensionNumber}\n`

        for (let index = 2; index < this.presenseLines.length; index++) {
            const line = this.presenseLines[index]
            result += `Line ${line.id} - Ext. ${line.extension.extensionNumber}\n`
        }

        // for (const line of this.presenseLines) {
        //     result += `Line ${line.id} - Ext. ${line.extension.extensionNumber}\n`
        // }

        return result
    }

    prettyPresenseUsers() {
        if (!this.presenseAllowedUsers) return ''

        let result = ''

        for (const line of this.presenseAllowedUsers) {
            result += `${line.extensionName} - ${line.extensionNumber}\n`
        }

        return result
    }

    prettyRingTime(rawRingCount: number | undefined) {
        if (!rawRingCount) return ''
        if (rawRingCount === 1) return 'Always ring'
        return `${rawRingCount} Rings / ${rawRingCount * 5} Seconds`
    }

    prettyDeviceRingTime() {
        let result = ''

        if (!this.businessHoursCallHandling || !this.businessHoursCallHandling.forwarding?.rules) return result
        const softPhoneOnTop = this.businessHoursCallHandling.forwarding.softPhonesPositionTop

        if (softPhoneOnTop) {
            const softPhoneRingCount = `${this.businessHoursCallHandling.forwarding.softPhonesAlwaysRing ? 'Always Ring' : this.prettyRingTime(this.businessHoursCallHandling.forwarding.softPhonesRingCount)}`
            result += `1 -- Desktop and Mobile Apps - ${softPhoneRingCount} (${this.businessHoursCallHandling.forwarding.notifyMySoftPhones ? 'Enabled' : 'Disabled'})\n`
        }

        for (let i = 0; i < this.businessHoursCallHandling?.forwarding?.rules.length; i++) {
            const rule = this.businessHoursCallHandling.forwarding?.rules[i]
            result += `${softPhoneOnTop ? rule.index + 1 : rule.index} -- ${this.prettyRingTime(rule.ringCount)} (${rule.enabled ? 'Enabled' : 'Disabled'})\n`
            for (const endpoint of rule.forwardingNumbers) {
                result += `${endpoint.label} ${endpoint.phoneNumber}\n`
            }
            result += '\n'
        }

        if (!softPhoneOnTop) {
            const softPhoneRingCount = `${this.businessHoursCallHandling.forwarding.softPhonesAlwaysRing ? 'Always Ring' : this.prettyRingTime(this.businessHoursCallHandling.forwarding.softPhonesRingCount)}`
            result += `${this.businessHoursCallHandling.forwarding.rules.length + 1} -- Desktop and Mobile Apps - ${softPhoneRingCount} (${this.businessHoursCallHandling.forwarding.notifyMySoftPhones ? 'Enabled' : 'Disabled'})`
        }

        return result
    }

    prettyAfterHoursDeviceRingTime() {
        let result = ''

        if (!this.afterHoursCallHandling || !this.afterHoursCallHandling.forwarding?.rules) return result
        const softPhoneOnTop = this.afterHoursCallHandling.forwarding.softPhonesPositionTop

        if (softPhoneOnTop) {
            const softPhoneRingCount = `${this.afterHoursCallHandling.forwarding.softPhonesAlwaysRing ? 'Always Ring' : this.prettyRingTime(this.afterHoursCallHandling.forwarding.softPhonesRingCount)}`
            result += `1 -- Desktop and Mobile Apps - ${softPhoneRingCount} (${this.afterHoursCallHandling.forwarding.notifyMySoftPhones ? 'Enabled' : 'Disabled'})\n`
        }

        for (let i = 0; i < this.afterHoursCallHandling?.forwarding?.rules.length; i++) {
            const rule = this.afterHoursCallHandling.forwarding?.rules[i]
            if (typeof rule.index !== 'number') {
                continue
            }

            result += `${softPhoneOnTop ? rule.index + 1 : rule.index} -- ${this.prettyRingTime(rule.ringCount)} (${rule.enabled ? 'Enabled' : 'Disabled'})\n`
            for (const endpoint of rule.forwardingNumbers) {
                result += `${endpoint.label} ${endpoint.phoneNumber}\n`
            }
            result += '\n'
        }

        if (!softPhoneOnTop) {
            const softPhoneRingCount = `${this.afterHoursCallHandling.forwarding.softPhonesAlwaysRing ? 'Always Ring' : this.prettyRingTime(this.afterHoursCallHandling.forwarding.softPhonesRingCount)}`
            result += `${this.afterHoursCallHandling.forwarding.rules.length + 1} -- Desktop and Mobile Apps - ${softPhoneRingCount} (${this.afterHoursCallHandling.forwarding.notifyMySoftPhones ? 'Enabled' : 'Disabled'})`
        }

        return result
    }

    prettyDelegates() {
        if (!this.delegates) return ''

        let result = ''

        for (const delegate of this.delegates) {
            result += `${delegate.extension.name} - ${delegate.extension.extensionNumber}\n`
        }

        return result
    }

    prettyVoicemailNotificationSettings() {
        if (!this.notifications) return ''

        if (this.notifications.voicemails.notifyByEmail) {
            if (this.notifications.voicemails.includeAttachment && this.notifications.voicemails.markAsRead) {
                return 'Notify and attach and mark as read'
            }
            else if (this.notifications.voicemails.includeAttachment) {
                return 'Notify and attach'
            }
            return 'Notify'
        }

        return 'Do not notify'
    }

    prettyFaxNotificationSettings() {
        if (!this.notifications?.inboundFaxes.notifyByEmail) return 'Do not notify'

        if (this.notifications.inboundFaxes.notifyByEmail) {
            if (this.notifications.inboundFaxes.includeAttachment && this.notifications.inboundFaxes.markAsRead) {
                return 'Notify and attach and mark as read'
            }
            else if (this.notifications.inboundFaxes.includeAttachment) {
                return 'Notify and attach'
            }
            return 'Notify'
        }

        return 'Do not notify'
    }

    callerIDNumber(feature: string) {
        if (!this.callerID) return ''

        for (const callerIdOption of this.callerID.byFeature) {
            if (callerIdOption.feature === feature) {
                if (Object.keys(callerIdOption.callerId).length === 0) return 'Not set'
                if (callerIdOption.callerId.type !== 'PhoneNumber') return callerIdOption.callerId.type
                return callerIdOption.callerId.phoneInfo.phoneNumber
            }
        }
        return ''
    }

    prettyDeviceCallerID() {
        let result = ''

        if (!this.callerID || !this.device) return ''

        for (const callerIdOption of this.callerID?.byDevice) {
            if (Object.keys(callerIdOption.callerId).length === 0) result += `${callerIdOption.device.name} - Not set\n`
            if (callerIdOption.callerId.type === 'Blocked') {
                result += 'Blocked\n'
                continue   
            }
            if (callerIdOption.callerId.type !== 'PhoneNumber') result += `${callerIdOption.device.name} - ${callerIdOption.callerId.type}`
            result += `${callerIdOption.device.name} - ${callerIdOption.callerId.phoneInfo.phoneNumber}\n`
        }

        return result
    }

    prettyPERLs() {
        let result = ''

        if (!this.erls) return result

        for (const erl of this.erls) {
            result += `${erl.name} -----------\n`
            result += `${erl.address.customerName}\n`
            result += `${erl.address.street}\n`
            if (erl.address.street2) {
                result += `${erl.address.street2}\n`
            }
            result += `${erl.address.city}\n`
            result += `${erl.address.country}\n`
            result += `${erl.address.zip}\n\n`
        }
        
        return result
    }

    prettyIntercomUsers() {
        if (!this.intercomUsers) return ''
        let result = ''

        for (const intercomUser of this.intercomUsers) {
            result += `${intercomUser.name} - ${intercomUser.extensionNumber}\n`
        }

        return result
    }

    prettyIncommingCallInfo() {
        let result = ''
        if (!this.incommingCallInfo) return result

        const callInfo = this.incommingCallInfo
        result += `Displayed Number: ${callInfo.displayedNumber}\n`
        result += `Play announcement (Direct calls): ${callInfo.announcement.directCalls}\n`
        result += `Play announcement (Queue calls): ${callInfo.announcement.callQueueCalls}`
        return result
    }

    prettyBusinessHours() {
        let result = ''

        if (!this.businessHours) return result
        if (Object.keys(this.businessHours.schedule).length === 0) return '24/7'

        const weeklyRanges = this.businessHours.schedule.weeklyRanges
        if (weeklyRanges.sunday) {
            result += `Sunday: ${this.convertTo12HourTime(weeklyRanges.sunday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.sunday[0].to)}\n`
        }
        if (weeklyRanges.monday) {
            result += `Monday: ${this.convertTo12HourTime(weeklyRanges.monday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.monday[0].to)}\n`
        }
        if (weeklyRanges.tuesday) {
            result += `Tuesday: ${this.convertTo12HourTime(weeklyRanges.tuesday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.tuesday[0].to)}\n`
        }
        if (weeklyRanges.wednesday) {
            result += `Wednesday: ${this.convertTo12HourTime(weeklyRanges.wednesday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.wednesday[0].to)}\n`
        }
        if (weeklyRanges.thursday) {
            result += `Thursday: ${this.convertTo12HourTime(weeklyRanges.thursday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.thursday[0].to)}\n`
        }
        if (weeklyRanges.friday) {
            result += `Friday: ${this.convertTo12HourTime(weeklyRanges.friday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.friday[0].to)}\n`
        }
        if (weeklyRanges.saturday) {
            result += `Saturday: ${this.convertTo12HourTime(weeklyRanges.saturday[0].from)} - ${this.convertTo12HourTime(weeklyRanges.saturday[0].to)}\n`
        }
        return result
    }

    prettyForwardAllCalls() {
        if (!this.forwardAllCalls || !this.forwardAllCalls.enabled) return 'Disabled'

        // UnconditionalForwarding, TransferToExtension, TakeMessagesOnly, PlayAnnouncementOnly
        if (this.forwardAllCalls.callHandlingAction === 'UnconditionalForwarding') {
            return `Forward to ${this.forwardAllCalls.externalNumber?.phoneNumber}`
        }
        else if (this.forwardAllCalls.callHandlingAction === 'TransferToExtension') {
            return `Forward to ${this.forwardAllCalls.extension?.name}`
        }
        else if (this.forwardAllCalls.callHandlingAction === 'TakeMessagesOnly') {
            return `Forward to voicemail`
        }
        else if (this.forwardAllCalls.callHandlingAction === 'PlayAnnouncementOnly') {
            return `Forward to announcement`
        }
        return ''
    }

    convertTo12HourTime(time: string) {
        const hour = parseInt(time.split(':')[0])
        const minute = time.split(':')[1]
        if (hour === 0) return `12:${minute} AM`
        if (hour === 12) return `12:${minute} PM`
        if (hour < 12) return `${hour}:${minute} AM`
        return `${hour - 12}:${minute} PM`
    }
}