import React, {useState, useEffect} from "react"
import useLogin from "../hooks/useLogin"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import useMessageQueue from "../hooks/useMessageQueue"
import useExtensionList from "../rcapi/useExtensionList"
import { Message } from "../models/Message"
import useFetchCallQueueMembers from "../rcapi/useFetchCallQueueMembers"
import useWriteExcelFile from "../hooks/useWriteExcelFile"
import CreateCallQueues from "./CreateCallQueues"
import Header from "./Header"
import {TextField, Button} from '@mui/material'

const CallQueues = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    const {fetchToken} = useGetAccessToken()
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    let {callQueues, isQueueListPending, fetchQueueMembers} = useFetchCallQueueMembers()
    let {writeExcel} = useWriteExcelFile()

    const handleClick = () => {
        fetchExtensions()
    }

    useEffect(() => {
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID, fetchToken])

    useEffect(() => {
        if (isExtensionListPending) return
        
        fetchQueueMembers(extensionsList)
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        if (isQueueListPending) return

        const header = ['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)']
        writeExcel(header, callQueues, 'queues.xlsx')
    }, [isQueueListPending, callQueues])

    return (
        <>
        <Header title='Call Queues' body='Do some stuff with call queues' />
            <div className="tool-card">
                <h2>Export Call Queues</h2>
                <TextField 
                    className="vertical-middle healthy-margin-right"
                    required
                    id="outline-required"
                    label="Account UID"
                    defaultValue="~"
                    size="small"
                    onChange={(e) => setTargetUID(e.target.value)}
                ></TextField>
                <Button variant="contained" onClick={handleClick}>Go</Button>
            </div>
            <CreateCallQueues />
            {messages.map((message: Message) => (
                <div key={message.body}>
                    <p className={message.type}>{message.body}</p>
                </div>
            ))}
        </>
    )
}

export default CallQueues