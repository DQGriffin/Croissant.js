import React, { useState } from 'react'
import RCExtension from '../models/RCExtension'
import useExtensionList from '../rcapi/useExtensionList'

const ExtensionAudit = () => {
    let [targetUID, setTargetUID] = useState("~")
    const { extensionsList, isExtensionListPending } = useExtensionList()

    const handleClick = () => {
        console.log('click')
    }

    return (
        <>
            <h2>Extension Audit</h2>
            <input type="text" className="input-field" value={targetUID} onChange={(e) => setTargetUID(e.target.value)}/>
            <button onClick={handleClick}>Go</button>
            <p>{isExtensionListPending ? "Fetching extensions": `${extensionsList.length} extensions fetched`}</p>
            {extensionsList.map((extension: RCExtension) => (
                <div key={extension.id}>
                    <p>{extension.toRow()}</p>
                </div>
            ))}
        </>
    )
}

export default ExtensionAudit