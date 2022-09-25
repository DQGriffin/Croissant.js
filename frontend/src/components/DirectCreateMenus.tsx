import React, {useEffect, useState} from "react";
import useMessageQueue from "../hooks/useMessageQueue";
import useExtensionList from "../rcapi/useExtensionList";
import useGetAccessToken from "../rcapi/useGetAccessToken";
import useReadExcel from "../hooks/useReadExcel";
import useExcelToIVRs from "../rcapi/useExcelToIVRs";
import FileSelect from "./FileSelect";
import useLogin from "../hooks/useLogin";
import useCreateIVRs from "../rcapi/useCreateIVRs";
import DataTable from "./DataTable";

const DirectCreateMenus = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    let [isReadyToSync, setReadyToSync] = useState(false)
    let {messages, postMessage} = useMessageQueue()
    const {fetchToken} = useGetAccessToken()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {excelData, isExcelDataPending, readFile} = useReadExcel()
    const {menus, isMenuConvertPending, converToMenus} = useExcelToIVRs()
    const {createMenus} = useCreateIVRs()

    const handleClick = () => {
        console.log('Clicked go button!')
    }

    const handleFileSelect = () => {
        if (!selectedFile) return

        fetchExtensions()
    }

    const handleSyncButtonClick = () => {
        setReadyToSync(true)
    }

    useEffect(() => {
        if (isExtensionListPending) return
        if (!selectedFile) return

        readFile(selectedFile, 'IVRs')
    }, [isExtensionListPending, extensionsList])

    useEffect(() => {
        if (isExcelDataPending) return

        converToMenus(excelData, extensionsList)
    }, [isExcelDataPending, excelData])

    useEffect(() => {
        if (isMenuConvertPending) return
        if (!isReadyToSync) return

        console.log(menus)
        createMenus(menus, extensionsList)
    }, [isReadyToSync, isMenuConvertPending, menus])

    useEffect(() => {
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID, fetchToken])
    
    return (
        <>
            <input type="text" className="input-field" value={targetUID} onChange={(e) => setTargetUID(e.target.value)}/>
            <button onClick={handleClick}>Go</button>
            <FileSelect handleSubmit={handleFileSelect} setSelectedFile={setSelectedFile} isPending={false} />
            {isExcelDataPending || isExtensionListPending || isMenuConvertPending ? <></> : <button onClick={handleSyncButtonClick}>Sync</button>}
            {isMenuConvertPending ? <></> : <DataTable header={['Name', 'Ext', 'Site', 'Prompt Mode', 'Prompt', 'Key 1 Action', 'Key 1 Destination', 'Key 2 Action', 'Key 2 Destination', 'Key 3 Action', 'Key 3 Destination', 'Key 4 Action', 'Key 4 Destination', 'Key 5 Action', 'Key 5 Destination', 'Key 6 Action', 'Key 6 Destination', 'Key 7 Action', 'Key 7 Destination', 'Key 8 Action', 'Key 8 Destination', 'Key 9 Action', 'Key 9 Destination', 'Key 0 Action', 'Key 0 Destination']} data={menus} />}
        </>
    )
}

export default DirectCreateMenus
