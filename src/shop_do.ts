// src/order.ts


import {DurableObject} from "cloudflare:workers";
import {OrderData} from "./orders";
import {atOrderAdded, atOrderCompleted} from "./response";
import {MAX_ORDERS} from "./common";

interface OrderResponse {
    success: boolean;
}


const orderTag = (id: number | string) => `order|${id}`

const SECONDS = 1000
const REPEAT = 1


export class Shop extends DurableObject {

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        // ctx.storage.setAlarm(Date.now() + REPEAT * SECONDS);
    }

    async alarm() {
        // The alarm handler will be invoked whenever an alarm fires.
        // You can use this to do work, read from the Transactional Storage API, make HTTP calls
        // and set future alarms to run using this.storage.setAlarm() from within this handler.
        console.log('yeah')
        this.ctx.storage.setAlarm(Date.now() + REPEAT * SECONDS);

        // await this.addOrder({name: 'Somethsing'})
        // Sleep for 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.completeOrder(1)
    }


    // Updates
    async addOrder(order: OrderData): Promise<number | null> {
        const orders: OrderData[] | undefined = await this.ctx.storage.get('orders')
        if (orders === undefined) {
            return null
        }

        if (orders.length >= MAX_ORDERS) {
            return null
        }

        const newOrder = {...order, id: orders.length + 1, status: 'pending'}
        orders.push(newOrder)

        await this.ctx.storage.put('orders', orders)

        const numPending = orders.filter(order => order.status === 'pending').length
        this.publishOrderAdded(newOrder.id, numPending)
        this.sendMessage('Order added', 'order')
        return newOrder.id
    }

    async completeOrder(id: number): Promise<true | undefined> {
        const orders: OrderData[] = (await this.ctx.storage.get('orders')) || []
        const order = orders.find(order => order.id === id)
        if (order === undefined)
            return

        order.status = 'completed'
        await this.ctx.storage.put('orders', orders)

        const numPending = orders.filter(order => order.status === 'pending').length
        this.publishOrderCompleted(id, numPending)
        return true
    }


    sendMessage(message: string, tag: string) {
        this.ctx.getWebSockets(tag).forEach(ws => ws.send(
            message
        ));
    }


    // List
    async listOrders(filter?: string): Promise<OrderData[] | null> {
        const orders: OrderData[] | undefined = await this.ctx.storage.get('orders')
        if (orders == undefined) {
            return null
        }

        if (filter) {
            return orders.filter(order => order.status === filter);
        }
        return orders;
    }

    // Get
    async getOrder(id: number): Promise<OrderData | undefined> {
        const orders: OrderData[] = (await this.ctx.storage.get('orders')) || [];
        return orders.find(order => order.id === id);
    }

    async setup(): Promise<OrderResponse | undefined> {
        const orders: OrderData[] | undefined = await this.ctx.storage.get('orders')
        if (orders !== undefined) {
            return
        }
        await this.ctx.storage.put('orders', [])
        return {success: true}
    }

    async fetch(request: Request): Promise<Response> {
        // Creates two ends of a WebSocket connection.
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        const url = new URL(request.url);
        const params = new URLSearchParams(url.search);

        let subscriptions: string[]
        switch (params.get('type')) {
            case 'dashboard':
                subscriptions = ['order']
                break;
            case 'order':
                const orderId = params.get('id')
                if (!orderId) {
                    return new Response('Missing order id', {status: 400})
                }

                subscriptions = [orderTag(orderId)]
                break;
            default:
                return new Response('Invalid type', {status: 400})
        }

        this.ctx.acceptWebSocket(server, subscriptions);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
        // Upon receiving a message from the client, the server replies with the same message,
        // and the total number of connections with the "[Durable Object]: " prefix
        console.log('Yay')
        this.ctx.getWebSockets().forEach(ws => ws.send(`[Durable Object] broadcast: ${message}, connections: ${this.ctx.getWebSockets().length}`));

        ws.send(`[Durable Object] message: ${message}, connections: ${this.ctx.getWebSockets().length}`);
    }

    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
        // If the client closes the connection, the runtime will invoke the webSocketClose() handler.
        console.log('Bay')
        ws.close(code, "Durable Object is closing WebSocket");
    }

    private publishOrderAdded(orderId: number, numPendingOrders: number) {
        const response = atOrderAdded(orderId, numPendingOrders)
        this.sendMessage(response.toString(), 'order')
    }

    private publishOrderCompleted(orderId: number, numPendingOrders: number) {
        const response = atOrderCompleted(orderId, numPendingOrders)
        this.sendMessage(response.toString(), 'order')
    }
}