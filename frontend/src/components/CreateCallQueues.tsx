import React, { useState, useEffect } from "react"
import FileSelect from "./FileSelect"
import useReadExcel from "../hooks/useReadExcel"
import useMessageQueue from "../hooks/useMessageQueue"
import useExtensionList from "../rcapi/useExtensionList"
import useExcelToQueues from "../rcapi/useExcelToQueues"
import useCreateCallQueues from "../rcapi/useCreateCallQueues"
import DataTable from "./DataTable"
import {Button} from '@mui/material'

const CreateCallQueues = () => {
    let {messages, postMessage} = useMessageQueue()
    let [isPending, setIsPending] = useState(true)
    let [isReadyToSync, setIsReadyToSync] = useState(false)
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    let {convert, queues, isQueueConvertPending} = useExcelToQueues()
    let {isCallQueueCreationPending, createQueues} = useCreateCallQueues()
    const [selectedSheet, setSelectedSheet] = useState<string>('')
    const defaultSheet = "Queues"

    const handleFileSelect = () => {
        if (!selectedFile) return
        console.log(`Selected file: ${selectedFile.name}`)
        fetchExtensions()
        // readFile(selectedFile, 'Queues')
    }

    const handleSyncButtonClick = () => {
        setIsReadyToSync(true)
    }

    useEffect(() => {
        if (isExtensionListPending) return
        if (!selectedFile) return

        readFile(selectedFile, selectedSheet)
    }, [isExtensionListPending, selectedFile])

    useEffect(() => {
        if (isExcelDataPending) return
        convert(excelData, extensionsList)
    }, [isExcelDataPending, excelData, extensionsList])

    useEffect(() => {
        if (isQueueConvertPending) return
        if (!isReadyToSync) return
        createQueues(queues, extensionsList)
    }, [isQueueConvertPending, isReadyToSync, extensionsList, queues])

    return (
        <div className="tool-card">
            <h2>Create Call Queues</h2>
            <FileSelect handleSubmit={handleFileSelect} isPending={false} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} />
            <Button variant="contained" onClick={handleSyncButtonClick}>Sync</Button>
            {isQueueConvertPending ? <></> : <DataTable header={['Name', 'Extension', 'Site', 'Status', 'Members']} data={queues} />}
        </div>
    )
}

export default CreateCallQueues