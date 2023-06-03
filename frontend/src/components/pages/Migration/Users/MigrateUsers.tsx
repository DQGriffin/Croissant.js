import { Button, Checkbox, FormControlLabel } from "@mui/material";
import React, { useEffect, useState } from "react";
import useLogin from "../../../../hooks/useLogin";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import useSidebar from "../../../../hooks/useSidebar";
import useWriteExcelFile from "../../../../hooks/useWriteExcelFile";
import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import { Extension } from "../../../../models/Extension";
import useExtensions from "../../../../rcapi/useExtensions";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import AdaptiveFilter from "../../../shared/AdaptiveFilter";
import FeedbackArea from "../../../shared/FeedbackArea";
import Header from "../../../shared/Header";
import ProgressBar from "../../../shared/ProgressBar";
import ToolCard from "../../../shared/ToolCard";
import UIDInputField from "../../../shared/UIDInputField";
import useFetchERLs from "../../Automatic Location Updates/hooks/useFetchERLs";
import useSiteList from "../Sites/hooks/useSiteList";
import { UserDataBundle } from "../User Data Download/models/UserDataBundle";
import useConfigureUsers from "./hooks/useConfigureUsers";
import useFetchUsers from "./hooks/useFetchUsers";
import useMigrateERLs from "./hooks/useMigrateERLs";
import useMigrateSites from "./hooks/useMigrateSites";
import useMigrateUsers from "./hooks/useMigrateUsers";

const MigrateUsers = () => {
    const [originalUID, setOriginalUID] = useState('')
    const [targetUID, setTargetUID] = useState('')
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [userDataBundles, setUserDataBundles] = useState<UserDataBundle[]>([])
    const [shouldShowSiteFilter, setShouldShowSiteFilter] = useState(false)
    const [isDoneFetchingSites, setIsDoneFetchingSites] = useState(false)
    const [shouldMigrateSites, setShouldMigrateSites] = useState(true)
    const [isPullingData, setIsPullingData] = useState(false)
    const [isMigrating, setIsMigrating] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const supportedExtensionTypes = ['ERLs', 'User', 'Limited Extension', 'Call Queue', 'IVR Menu', 'Message-Only', 'Announcement-Only']
    const [sites, setSites] = useState<SiteData[]>([])

    const handleSiteFetchCompletion = (sites: SiteData[]) => {
        setSites(sites)
        setIsDoneFetchingSites(true)
    }

    useLogin('migrateusers', isPullingData || isMigrating)
    useSidebar('Migrate Users')
    const {fetchToken: fetchOriginalAccountToken, companyName: originalCompanyName, hasCustomerToken: hasOriginalAccountToken, error: originalAccountTokenError, isTokenPending: isOriginalAccountTokenPending, userName: originalUserName} = useGetAccessToken()
    const {fetchToken: fetchTargetAccountToken, companyName: targetCompanyName, hasCustomerToken: hasTargetAccountToken, error: targetAccountTokenError, isTokenPending: isTargetAccountTokenPending, userName: targetUserName} = useGetAccessToken()
    const {postMessage, messages, errors, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchSites, isFetchingSites} = useSiteList(postMessage, postTimedMessage, postError, handleSiteFetchCompletion)
    const {extensionsList: originalExtensionList, fetchExtensions: fetchOriginalExtensions, isExtensionListPending: isOriginalExtensionListPending, isMultiSiteEnabled} = useExtensions(postMessage)
    const {extensionsList: targetExtensionList, fetchExtensions: fetchTargetExtensions, isExtensionListPending: isTargetExtensionListPending, isMultiSiteEnabled: targetAccountHasMultisite} = useExtensions(postMessage)

    const {fetchERLs, erls, isERLListPending} = useFetchERLs()
    const {fetchERLs: fetchTargetERLs, erls: targetERLList, isERLListPending: isTargetERLListPending} = useFetchERLs()
    const {fetchUsers, progressValue: userFetchProgress, maxProgress: maxUserFetchProgress} = useFetchUsers(postMessage, postTimedMessage, postError)

    const {migrateSites, maxProgress: maxSiteProgress, progressValue: siteMigrationProgress} = useMigrateSites(postMessage, postTimedMessage, postError)
    const {migrateERLs, progressValue: erlProgress, maxProgress: maxERLProgress} = useMigrateERLs(postMessage, postTimedMessage, postError)
    const {migrateUsers} = useMigrateUsers(postMessage, postTimedMessage, postError)
    const {configureUsers} = useConfigureUsers(postMessage, postTimedMessage, postError)

    const {writeExcel} = useWriteExcelFile()
    
    useEffect(() => {
        if (originalUID.length < 5) return
        localStorage.setItem('target_uid', originalUID)
        fetchOriginalAccountToken(originalUID)
    },[originalUID])

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchTargetAccountToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasTargetAccountToken) return
        fetchTargetExtensions()
    }, [hasTargetAccountToken])

    useEffect(() => {
        if (isTargetExtensionListPending) return
        fetchTargetERLs()
    }, [isTargetExtensionListPending])

    useEffect(() => {
        if (!isDoneFetchingSites) return
        fetchOriginalExtensions()
    }, [isDoneFetchingSites])

    useEffect(() => {
        if (!hasOriginalAccountToken) return
        fetchSites()
    }, [hasOriginalAccountToken])

    useEffect(() => {
        if (!isDoneFetchingSites) return
        fetchERLs()
    }, [isDoneFetchingSites])

    useEffect(() => {
        if (isOriginalExtensionListPending) return

        if (!isMultiSiteEnabled) {
            setFilteredExtensions(originalExtensionList)
            return
        }

        const siteNames = originalExtensionList.filter((ext) => ext.prettyType() === 'Site').map((site) => site.data.name)
        setSiteNames(['Main Site', ...siteNames])
        setShouldShowSiteFilter(true)
    }, [isOriginalExtensionListPending])

    useEffect(() => {
        const selected = originalExtensionList.filter((ext) => ext.data.status !== 'Unassigned' && selectedExtensionTypes.includes(ext.prettyType()) && selectedSiteNames.includes(ext.data.site?.name ?? ''))
        console.log('selected extensions')
        console.log(selected)
        setFilteredExtensions(selected)
    }, [selectedExtensionTypes, selectedSiteNames])

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isPending) return
        const extensions = selected as Extension[]
        setSelectedExtensions(extensions)
    }

    const handleDisoverButtonClick = async () => {
        setIsPullingData(true)
        const userDataBundles = await fetchUsers(selectedExtensions.filter((ext) => ext.prettyType() === 'User'), originalExtensionList)
        setUserDataBundles(userDataBundles)
        console.log('Fetched users')
        console.log(userDataBundles)
    }

    const handleMigrateButtonClick = async () => {
        setIsPending(true)
        setIsMigrating(true)
        let targetExts = targetExtensionList
        let targetERLs = targetERLList

        if (shouldMigrateSites) {
            const selectedSites = sites.filter((site) => selectedSiteNames.includes(site.name))
            const siteExtensions = await migrateSites(selectedSites)
            targetExts = [...targetExts, ...siteExtensions]
        }

        let unassignedExtensions = targetExtensionList.filter((ext) => ext.data.status === 'Unassigned' && ext.prettyType() === 'User')

        if (selectedExtensionTypes.includes('ERLs')) {
            const migratedERLs = await migrateERLs(erls, targetExts)
            targetERLs = [...targetERLs, ...migratedERLs]
        }

        console.log(`Should be migrating ${userDataBundles.length} users`)
        console.log(userDataBundles)
        await migrateUsers(userDataBundles, unassignedExtensions, targetExts)

        const migratedUsers = userDataBundles.map((bundle) => bundle.extension)
        targetExts = [...targetExts, ...migratedUsers]

        // writeExcel([], targetExts, 'Exts', 'target-ext.xlsx')
        await configureUsers(userDataBundles, targetERLs, originalExtensionList, targetExts)
    }

    return (
        <>
            <Header title='Migration' body='Migrate from one account to another' />
            <ToolCard>
                <h2>Original Account</h2>
                <p>Enter the UID that you are migrating <em>from</em></p>
                <UIDInputField disabled={hasOriginalAccountToken} disabledText={originalCompanyName} setTargetUID={setOriginalUID} loading={isOriginalAccountTokenPending} error={originalAccountTokenError} />
            </ToolCard>
            <ToolCard>
                <h2>Make Selections</h2>
                <AdaptiveFilter options={supportedExtensionTypes} title='Extension Types' placeholder='Search' setSelected={setSelectedExtensionTypes} />
                {shouldShowSiteFilter ? <AdaptiveFilter options={siteNames} title='Sites' placeholder='Search' setSelected={setSelectedSiteNames} /> : <></>}
                <FormControlLabel control={<Checkbox defaultChecked value={shouldMigrateSites} onChange={(e) => setShouldMigrateSites(e.target.checked)} />} label="Migrate Sites" />
                <Button variant='contained' onClick={handleDisoverButtonClick} disabled={isPullingData} >Discover</Button>
                <ProgressBar value={userFetchProgress} max={maxUserFetchProgress} label='Users' />
                <FeedbackArea gridData={filteredExtensions} onFilterSelection={handleFilterSelection} messages={[]} errors={[]} timedMessages={[]} />
            </ToolCard>
            <ToolCard>
                <h2>Target Account</h2>
                <p>Enter the UID that you are migrating <em>to</em></p>
                <UIDInputField disabled={hasTargetAccountToken} disabledText={targetCompanyName} setTargetUID={setTargetUID} loading={isTargetAccountTokenPending} error={targetAccountTokenError} />
                <Button variant='contained' onClick={handleMigrateButtonClick} disabled={!hasTargetAccountToken || isERLListPending || isTargetERLListPending || isMigrating} >Migrate</Button>
                <ProgressBar label='ERLs' value={erlProgress} max={maxERLProgress} />
                <FeedbackArea messages={messages} timedMessages={timedMessages} errors={errors} />
            </ToolCard>
        </>
    )
}

export default MigrateUsers