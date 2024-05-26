import {Hono} from "hono";
import {createMiddleware} from "hono/factory";
import {Shop} from "./shop_do";
import {OrderList} from "./components/OrderList";
import {cors} from "hono/cors";

type Variables = {
    shop: Shop
}

const shopDoMiddleware = createMiddleware(async (c, next) => {
    const shopName = c.req.param('shopName')
    if (!shopName) {
        return c.text('Shop not found', 404)
    }

    // Retrieve the Shop Durable Object
    const id: DurableObjectId = c.env.SHOP.idFromName(shopName)
    c.set('shop', c.env.SHOP.get(id))
    await next()
})


export const shopRouter = new Hono<{ Variables: Variables }>()
shopRouter.use('/*', shopDoMiddleware)
shopRouter.get('/ws', async (c) => {
        const upgradeHeader = c.req.header('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
            return new Response('Durable Object expected Upgrade: websocket', {status: 426});
        }

        console.log('upgradeWebSocket')

        const shop = c.get('shop')
        return shop.fetch(c.req.raw)
    }
)

shopRouter.use("/*", cors())
shopRouter.post('/order', async (c) => {
    const shop = c.get('shop')

    const orderData = await c.req.json()

    let result = await shop.addOrder(orderData)
    if (result === null) {
        return c.text('Failed to place order', 400)
    }
    return c.text(`Success! #${result}`)
})

shopRouter.post('/order/:orderId/complete', async (c) => {
    const shop = c.get('shop')

    const orderId = parseInt(c.req.param('orderId'))

    let result = await shop.completeOrder(orderId)
    if (result === null) {
        return c.text('Failed to place order', 400)
    }
    return c.text(`Success! #${result}`)
})

shopRouter.post('/', async (c) => {
    const shop = c.get('shop')

    const result = await shop.setup()
    if (result === undefined) {
        return c.text('Failed to create shop', 400)
    }
    return c.text('Shop created')
})


shopRouter.get('/orders/pending', async (c) => {
    const shop = c.get('shop')

    const orders = await shop.listOrders('pending')
    if (orders === null) {
        return c.text('Unknown shop', 404)
    }
    const foo = <OrderList orders={orders} mode={"pending"}/>
    console.log(foo.toString())
    return c.html(foo)
})

