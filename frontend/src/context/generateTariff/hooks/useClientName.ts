import { useState } from "react"
import { useApi } from "../../../hooks/api/api"

const useClientName = () => {
    const api = useApi();
    const [clientName, setClientName] = useState("")

    async function getClientName(id: string) {
        const leadId = Number(id)
        if (!Number.isInteger(leadId) || leadId <= 0) {
          setClientName("")
          return ""
        }
        return api.kommo.getLead(leadId)
            .then(res => {
              setClientName(res.name + "")
              return res.name + ""
            })
            .catch(() => {
              setClientName("")
              return ""
            })
      }
    return ({
        clientName,
        setClientName,
        getClientName,
    })
}

export default useClientName