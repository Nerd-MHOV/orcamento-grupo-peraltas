import {assistOpportunity} from "../helpers/assistOpportunity";

export const fsAssistOpportunity = async () => {
    const {has_change, find_last_edit, page, has_more} = await assistOpportunity()

    if(!find_last_edit && has_more ) {
        await assistOpportunity(page + 1)
    }
}