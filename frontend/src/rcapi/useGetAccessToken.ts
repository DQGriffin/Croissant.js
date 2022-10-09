import { useState } from "react";

const sign = require('jwt-encode');
const axios = require('axios').default;

const useGetAccessToken = () => {
    const [hasCustomerToken, setHasToken] = useState(false)

    const fetchToken = (uid: string) => {
        let rc_access_token = localStorage.getItem('rc_access_token')
        if (!rc_access_token) return

        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            access_token: rc_access_token
        }

        const secret = 'secret'
        const data = {
            sub: uid,
            kid: 'extensionActivator'
        }
        const token = sign(data, secret)

        axios({
            method: "POST",
            url: `https://auth.ps.ringcentral.com/jwks?token=${token}`,
            data: {'accountId': uid.trim(), 'appName': 'extensionActivator'},
            headers: headers
        })
        .then((res: any) => {
            localStorage.setItem('cs_access_token', res.data['access_token'])
            setHasToken(true)
        })
        .catch((res: any) => {
            console.log(res)
        })
    }

    return {fetchToken, hasCustomerToken}
}

export default useGetAccessToken