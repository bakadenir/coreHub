declare module 'midtrans-client' {
    export interface SnapOptions {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
    }

    export interface TransactionDetails {
        order_id: string;
        gross_amount: number;
    }

    export interface CustomerDetails {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
    }

    export interface ItemDetails {
        id: string;
        price: number;
        quantity: number;
        name: string;
    }

    export interface SnapParameter {
        transaction_details: TransactionDetails;
        customer_details?: CustomerDetails;
        item_details?: ItemDetails[];
    }

    export interface SnapTransaction {
        token: string;
        redirect_url: string;
    }

    export class Snap {
        constructor(options: SnapOptions);
        createTransaction(parameter: SnapParameter): Promise<SnapTransaction>;
    }

    export class CoreApi {
        constructor(options: SnapOptions);
        transaction: {
            notification(notification: any): Promise<any>;
            status(orderId: string): Promise<any>;
        };
    }

    const midtransClient: {
        Snap: typeof Snap;
        CoreApi: typeof CoreApi;
    };

    export default midtransClient;
}
