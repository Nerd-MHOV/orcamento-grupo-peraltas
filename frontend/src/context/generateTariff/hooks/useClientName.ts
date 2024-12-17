import { useState } from "react"
import { useApi } from "../../../hooks/api/api"

const useClientName = () => {
    const api = useApi();
    const [clientName, setClientName] = useState("")

    async function getClientName(id: string) {
        return api.rd.getDealById(id)
            .then(res => {
              setClientName(res.name + "")
              return res.name + ""
            })
            .catch(err => {
              setClientName("")
              return ""
            })
      }
    return ({
        clientName,
        getClientName,
    })
}

export default useClientName