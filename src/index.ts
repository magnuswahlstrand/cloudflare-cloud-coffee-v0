import {Hono} from 'hono'
import {logger} from "hono/logger";

import {Shop} from "./shop_do";
import {shopRouter} from "./shop_router";

export {Shop}

export type Bindings = {
    SHOP: DurableObjectNamespace<Shop>;
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(logger())

// TODO: Setup correctly before deploying to prod
app.route('/shop/:shopName', shopRouter)

export default app
