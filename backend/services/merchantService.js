import { google } from "googleapis";
import auth from "../config/googleAuth.js";

const merchantService = {
    getProducts: async () => {
        const authClient = await auth.getClient();
        const content = google.content({ version: "v2.1", auth: authClient });

        const merchantId = "5400577233";

        const response = await content.products.list({
            merchantId: merchantId
        });

        return response.data;
    }
};

export default merchantService;
