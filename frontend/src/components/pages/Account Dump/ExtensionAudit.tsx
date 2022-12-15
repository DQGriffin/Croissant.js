import React, { useEffect, useState } from 'react'
import useLogin from '../../../hooks/useLogin'
import useMessageQueue from '../../../hooks/useMessageQueue'
import useExtensionList from '../../../rcapi/useExtensionList'
import useGetAccessToken from '../../../rcapi/useGetAccessToken'
import Header from '../../shared/Header'
import {Button} from '@mui/material'
import FeedbackArea from '../../shared/FeedbackArea'
import usePostTimedMessage from '../../../hooks/usePostTimedMessage'
import useAnalytics from '../../../hooks/useAnalytics'
import UIDInputField from '../../shared/UIDInputField'
import useWritePrettyExcel from '../../../hooks/useWritePrettyExcel'
import useWriteExcelFile from '../../../hooks/useWriteExcelFile'
import FilterArea from '../../shared/FilterArea'
import RCExtension from '../../../models/RCExtension'
import { DataGridFormattable } from '../../../models/DataGridFormattable'

const ExtensionAudit = () => {
    useLogin('accountdump')
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    let {messages, errors, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {writeExcel} = useWriteExcelFile()

    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        const extensions = selected as RCExtension[]
        setSelectedExtensions(extensions)
    }

    useEffect(() => {
        console.log('selected extensions: ')
        console.log(selectedExtensions)
    }, [selectedExtensions])


    const handleClick = () => {
        fetchExtensions()
        fireEvent('extension-audit')
    }

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (isExtensionListPending) return

        let header = ['Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']
        // writePrettyExcel(header, extensionsList, 'Extensions', 'account-dump.xlsx')
        writeExcel(header, extensionsList, 'Extensions', 'account-dump.xlsx')
    }, [isExtensionListPending, extensionsList])

    return (
        <>
            <Header title='Account Dump' body='This tool generatates a list of all extensions in an account'/>
            <div className='tool-card'>
            <h2>Account Dump</h2>
            <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} />
            <Button className='healthy-margin-right' disabled={!hasCustomerToken} variant='contained' onClick={handleClick}>Go</Button>
            {/* {extensionsList.length > 0 ? <FilterArea items={extensionsList} defaultSelected={extensionsList.map((extension) => extension.id)} showSiteFilter={true} onSelectionChanged={handleFilterSelection} /> : <></>} */}
            {extensionsList.length > 0 ? <FeedbackArea tableHeader={['Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']} gridData={extensionsList} onFilterSelection={handleFilterSelection} tableData={extensionsList} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
        </div>
        </>
    )
}

export default ExtensionAudit