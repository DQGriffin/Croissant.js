import ExcelFormattable from "../../../../../models/ExcelFormattable";
import { Extension } from "../../../../../models/Extension";
import { Greeting } from "../../../../../models/Greetings";
import { UserDataRow } from "./UserDataRow";

export class UserDataBundle {

    public userGroups = ''

    constructor(public extension: Extension, public extendedData: ExtendedUserData | undefined) {}

    toRows(): UserDataRow[] {
        const rows: UserDataRow[] = []
        if (!this.extendedData) return []

        if (this.extendedData.devices) {
            for (let i = 0; i < this.extendedData?.devices.length; i++) {
                const row = new UserDataRow(this.extension, 'Full DL', this.extendedData.devices[i], undefined, this.extendedData.businessHoursCallHandling, this.extendedData.afterHoursCallHandling, this.extendedData.notifications, this.extendedData.callerID, this.extendedData.blockedCallSettings, this.extendedData.blockedPhoneNumbers, this.extendedData.presenseLines, this.extendedData.presenseSettings, this.extendedData.presenseAllowedUsers, this.extendedData.intercomStatus, this.extendedData.delegates, this.extendedData.pERLs, this.extendedData.roles, this.extendedData.incommingCallInfo, this.extendedData.businessHours, this.extendedData.forwardAllCalls, this.extendedData.defaultBridge, this.userGroups)
                rows.push(row)
            }
        }

        if (this.extendedData.directNumbers) {
            for (const directNumber of this.extendedData.directNumbers) {
                const row = new UserDataRow(this.extension, 'Additional DID', undefined, directNumber.phoneNumber, this.extendedData.businessHoursCallHandling, this.extendedData.afterHoursCallHandling, this.extendedData.notifications, this.extendedData.callerID, this.extendedData.blockedCallSettings, this.extendedData.blockedPhoneNumbers, this.extendedData.presenseLines, this.extendedData.presenseSettings, this.extendedData.presenseAllowedUsers, this.extendedData.intercomStatus, this.extendedData.delegates, this.extendedData.pERLs, this.extendedData.roles, this.extendedData.incommingCallInfo, this.extendedData.businessHours, this.extendedData.forwardAllCalls, this.extendedData.defaultBridge, this.userGroups)
                rows.push(row)
            }
        }

        if ((!this.extendedData.devices && !this.extendedData.directNumbers) || (this.extendedData.devices.length === 0 && this.extendedData.directNumbers?.length === 0)) {
            const row = new UserDataRow(this.extension, 'Virtual', undefined, undefined, this.extendedData.businessHoursCallHandling, this.extendedData.afterHoursCallHandling, this.extendedData.notifications, this.extendedData.callerID, this.extendedData.blockedCallSettings, this.extendedData.blockedPhoneNumbers, this.extendedData.presenseLines, this.extendedData.presenseSettings, this.extendedData.presenseAllowedUsers, this.extendedData.intercomStatus, this.extendedData.delegates, this.extendedData.pERLs, this.extendedData.roles, this.extendedData.incommingCallInfo, this.extendedData.businessHours, this.extendedData.forwardAllCalls, this.extendedData.defaultBridge, this.userGroups)
            rows.push(row)
        }

        return rows
    }
}

export interface ExtendedUserData {
    devices: Device[]
    businessHoursCallHandling?: CallHandling
    afterHoursCallHandling?: CallHandling
    notifications?: Notifications
    callerID?: CallerID
    blockedCallSettings?: BlockedCallSettings
    blockedPhoneNumbers?: BlockedPhoneNumber[]
    presenseLines?: PresenseLine[]
    presenseSettings?: PresenseSettings
    presenseAllowedUsers?: PresenseAllowedUser[]
    intercomStatus?: IntercomStatus
    delegates?: Delegate[]
    pERLs?: PERL[]
    roles?: Role[]
    incommingCallInfo?: IncommingCallInfo
    businessHours?: BusinessHours
    directNumbers?: PhoneNumber[]
    forwardAllCalls?: ForwardAllCalls
    defaultBridge?: DefaultBridge
}

export interface Device {
    id: string
    uri: string
    sku: string
    type: string
    name: string
    serial: string
    status: string
    computerName: string
    model: {
        id: string
        name: string
        deviceClass: string
    }
    emergencyServiceAddress: {
        street: string
        street2: string
        city: string
        zip: string
        customerName: string
        state: string
        stateName: string
        country: string
        countryName: string

    }
    emergency: {
        location?: {
            id: string
            name: string
        }
        visibility: string
    }
    phoneLines: [{
        lineType: string
        phoneInfo: {
            phoneNumber: string
        }
    }]
}

export interface CallHandling {
    greetings: Greeting[]
    screening: string
    callHandlingAction: string
    forwarding: {
        notifyMySoftPhones: boolean
        notifyAdminSoftPhones: boolean
        softPhonesRingCount: number
        softPhonesAlwaysRing: boolean
        ringingMode: string
        softPhonesPositionTop: boolean
        rules: [
            {
                index: number
                ringCount: number
                enabled: boolean
                forwardingNumbers: [
                    {
                        id?: string
                        phoneNumber: string
                        label: string
                        type: string
                        uri?: string
                    }
                ]
            }
        ]
    }
    missedCall: {
        actionType: string
        externalNumber: {
            phoneNumber: string
        }
        extension: {
            id: string
            displayName?: string
            externalNumber: {
                phoneNumber: string
            }
        }
    }
    voicemail: {
        enabled: boolean
        recipient: {
            id: string
            displayName?: string
            uri?: string
        }
    }
    transfer: {
        extension: {
            id: string
            uri?: string
            extensionNumber?: string
        }
    }
    queue?: {
        transferMode: string
        
    }
}

export interface Notifications {
    uri: string
    emailRecipients: [
        {
            extensionId: string
            fullName: string
            extensionNumber: string
            status: string
            emailAddresses: string
        }
    ]
    emailAddresses: string[]
    smsEmailAddresses: string[]
    advancedMode: boolean
    voicemails: {
        includeTranscription: boolean
        notifyByEmail: boolean
        includeAttachment: boolean
        markAsRead: boolean
    }
    inboundFaxes: {
        notifyByEmail: boolean
        includeAttachment: boolean
        markAsRead: boolean
    }
    missedCalls: {
        notifyByEmail: boolean
    }
    inboundTexts: {
        notifyByEmail: boolean
    }
    outboundFaxes: {
        notifyByEmail: boolean
    }
}

export interface CallerID {
    uri: string
    byDevice: [
        {
            device: {
                id: string
                name: string
            }
            callerId: {
                type: string
                phoneInfo: {
                    phoneNumber: string
                }
            }
        }
    ]
    byFeature: [
        {
            feature: string
            callerId: {
                type: string
                phoneInfo: {
                    phoneNumber: string
                }
            }
        }
    ]
}

export interface BlockedCallSettings {
    mode: string
    noCallerId: string
    payPhones: string
}

export interface BlockedPhoneNumber {
    phoneNumber: string
    label: string
    status: string
    uri?: string
    id?: string
}

export interface PresenseLine {
    id: string
    extension: {
        id: string
        extensionNumber?: string
        extensionName?: string
        type?: string
        uri?: string
    }
    uri?: string
    notEditableOnHud?: boolean
}

export interface PresenseSettings {
    allowSeeMyPresence: boolean
    ringOnMonitoredCall: boolean
    pickUpCallsOnHold: boolean
}

export interface PresenseAllowedUser {
    id: string
    extensionNumber: string
    extensionName: string
}

export interface IntercomStatus {
    enabled: boolean
}

export interface Delegate {
    extension: {
        extensionNumber: string
        name: string
    }
}

export interface PERL {
    id?: string
    name: string
    visibility: string
    address: {
        street: string
        street2: string
        city: string
        stateName: string
        zip: string
        country: string
        customerName: string
    }
}

export interface Role {
    displayName: string
    siteCompatible: string
    siteRestricted: string
}

export interface IncommingCallInfo {
    displayedNumber: string
    maskUnknown: boolean
    additionalDigits: {
        enabled: boolean
        position: string
        template: string
    }
    condition: string
    announcement: {
        directCalls: string
        callQueueCalls: string
        includeCalledExtensionName: boolean
    }
    pinRequired: boolean
}

export interface BusinessHours {
    schedule: {
        weeklyRanges: {
            monday?: [{
                from: string
                to: string
            }]
            tuesday?: [{
                from: string
                to: string
            }]
            wednesday?: [{
                from: string
                to: string
            }]
            thursday?: [{
                from: string
                to: string
            }]
            friday?: [{
                from: string
                to: string
            }]
            saturday?: [{
                from: string
                to: string
            }]
            sunday?: [{
                from: string
                to: string
            }]
        }
    }
}

export interface PhoneNumber {
    id: string
    phoneNumber: string
    usageType: string
    extension?: {
        id: string
        extensionNumber: string
    }
}

export interface ForwardAllCalls {
    enabled: boolean
    ranges: [{
        from: string
        to: string
    }]
    callHandlingAction: string
    extension?: {
        name: string
        extensionNumber: string
        id: string
    }
    externalNumber: {
        phoneNumber: string
    }
}

export interface DefaultBridge {
    name: string
    type: string
    pins: {
        web: string
    }
}