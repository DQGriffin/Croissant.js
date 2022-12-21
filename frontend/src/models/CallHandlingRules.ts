import { TransferPayload, UnconditionalForwardingPayload } from "./TransferPayload"

export interface CallHandlingRules {
    transferMode: string
    noAnswerAction: string
    fixedOrderAgents?: FixedOrderAgent[]
    holdAudioInterruptionMode: string
    holdAudioInterruptionPeriod?: number
    holdTimeExpirationAction: string
    agentTimeout?: number
    holdTime: number
    wrapUpTime?: number
    maxCallersAction?: string
    transfer?: TransferPayload[]
    unconditionalForwarding?: UnconditionalForwardingPayload[]
}

export interface FixedOrderAgent {
    extension: {
        id: string,
        extensionNumber: string,
        name: string,
    }
    index: number
}