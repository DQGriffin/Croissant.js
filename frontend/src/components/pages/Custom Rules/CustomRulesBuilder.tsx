import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel";
import useExtensions from "../../../rcapi/useExtensions";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreateCustomRule from "./hooks/useCreateCustomRule";
import useReadCustomRules from "./hooks/useReadCustomRules";
import { CustomRule, CustomRuleData } from "./models/CustomRule";
import { CustomRuleSchema } from "./models/CustomRuleSchema";

const CustomRulesBuilder = () => {
    const [targetUID, setTargetUID] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const defaultSheet = 'Custom rules'

    const increaseProgress = () => {
        setCurrentExtensionIndex( prev => prev + 1)
    }

    useLogin('customrules', isSyncing)
    useSidebar('Build Custom Rules')
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensions(postMessage)
    const {readFile, isExcelDataPending, excelData} = useReadExcel()
    const {validate, isDataValidationPending, validatedData} = useValidateExcelData(CustomRuleSchema, postMessage, postError)
    const {readCustomRules, isRuleReadPending, customRules} = useReadCustomRules()
    const {createCustomRule} = useCreateCustomRule(postMessage, postTimedMessage, postError, increaseProgress)
    const {writePrettyExcel} = useWritePrettyExcel()

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchExtensions()
    }, [hasCustomerToken])

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        console.log('Excel Data')
        console.log(excelData)

        console.log('Validated Data')
        console.log(validatedData)
        readCustomRules(validatedData, extensionsList)
    }, [isDataValidationPending])

    useEffect(() => {
        if (isRuleReadPending) return
        console.log('Read Custom Rules')
        console.log(customRules)

        console.log('Payloads')
        for (const rule of customRules) {
            console.log(rule.payload())
        }
    }, [isRuleReadPending])

    useEffect(() => {
        if (currentExtensionIndex >= customRules.length || !isSyncing) return
        createCustomRule(customRules[currentExtensionIndex])
    }, [currentExtensionIndex, isSyncing])

    const handleTemplateButtonClick = () => {
        writePrettyExcel([], [], 'Custom Rules', 'custom-rules.xlsx', '/custom-rules-template.xlsx')
    }

    const handleFileSelection = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
    }

    return (
        <>
            <Header title='Build Custom Rules' body='Build and update custom rules' />
            <div className="tool-card">
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <Button variant='contained' onClick={handleTemplateButtonClick}>Template</Button>
                <FileSelect enabled={hasCustomerToken} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelection} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button variant='contained' onClick={handleSyncButtonClick} disabled={isRuleReadPending || isSyncing} >Sync</Button>
                {isSyncing ? <progress value={currentExtensionIndex} max={customRules.length} /> : <></>}
                <FeedbackArea gridData={customRules} messages={messages} timedMessages={timedMessages} errors={errors}  />
            </div>
        </>
    )
}

export default CustomRulesBuilder;