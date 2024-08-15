import axios from "axios"
import { Dialog } from "../services/chatguru/Dialog";


/*
    verifica na planilha do google, se manda dialogo para os clientes
*/
const urlGform = 'https://script.googleusercontent.com/macros/echo?user_content_key=Eo1Ibj5gChBi5Kgv3qV6CYasDAoqn2Xc7ApiDVnLoyoOYsLWKfVJb1x54htA1dUbI0eeZb83uodwLxQJ55T0p1DRXEPLSY98m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnNDasiZwjNv1ruALyCF38tw7mLHQtawvz8xkH_EfmA3XtRFUU8CBye49qM3uxDeaeXSJvjwNIaNMhoYVxuOwY_lLQ2bUJoVbww&lib=MLrAqLxNrNjbk__S6BTMqzNdsv6zkqyqw'
export const fsAssistGoogleForms = async  () => {

    console.log(" [ CRON ] fs assist google forms ")

    const response = (await axios.get(urlGform)).data.data;


    if ( Array.isArray(response) ) {
        response.map(async res => {
            const dialog =  await Dialog(res.phone, '65f2f0765287d67627aface2');

            console.log(` [ INFO ] GOOGLE FORMS - send dialog - ${res.phone} 65f2f0765287d67627aface2 ${dialog?.code} `)
            
        })
    }
    return response
}





