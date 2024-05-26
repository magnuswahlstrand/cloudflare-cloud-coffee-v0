import {describe, expect, it} from "vitest"

import {env, runInDurableObject} from "cloudflare:test";
import {Shop} from "../src/shop_do";


describe('Shop Durable Object', () => {
    it('Add order', async () => {
        const id: DurableObjectId = env.SHOP.newUniqueId();
        const stub = env.SHOP.get(id) as DurableObjectStub<Shop>;
        await runInDurableObject<DurableObjectStub<Shop>, void>(stub, async (instance, state) => {
            await instance.setup()
            const result = await instance.addOrder({name: 'order1'})
            expect(result).toEqual(1)
        })
    })

    it('List all orders', async () => {
        const id: DurableObjectId = env.SHOP.newUniqueId();
        const stub = env.SHOP.get(id) as DurableObjectStub<Shop>;
        await runInDurableObject<DurableObjectStub<Shop>, void>(stub, async (instance, state) => {
            await instance.setup()
            await instance.addOrder({name: 'order1'})
            await instance.addOrder({name: 'order2'})
            const orders = await instance.listOrders()
            expect(orders).toEqual([
                {id: 1, name: 'order1', status: 'pending'},
                {id: 2, name: 'order2', status: 'pending'},
            ])
        })
    })

    it('List pending orders', async () => {
        const id: DurableObjectId = env.SHOP.newUniqueId();
        const stub = env.SHOP.get(id) as DurableObjectStub<Shop>;
        await runInDurableObject<DurableObjectStub<Shop>, void>(stub, async (instance, state) => {
            await instance.setup()
            await instance.addOrder({name: 'order1'})
            await instance.addOrder({name: 'order2'})
            await instance.completeOrder(1) // Complete the first order
            const orders = await instance.listOrders('pending')
            expect(orders).toEqual([{id: 2, name: 'order2', status: 'pending'}])
        })
    })

    it('List completed orders', async () => {
        const id: DurableObjectId = env.SHOP.newUniqueId();
        const stub = env.SHOP.get(id) as DurableObjectStub<Shop>;
        await runInDurableObject<DurableObjectStub<Shop>, void>(stub, async (instance, state) => {
            await instance.setup()
            await instance.addOrder({name: 'order1'})
            await instance.addOrder({name: 'order2'})
            await instance.completeOrder(1) // Complete the first order
            const orders = await instance.listOrders('completed')
            expect(orders).toEqual([{id: 1, name: 'order1', status: 'completed'}])
        })
    })

    it('Mark pending order as completed', async () => {
        const id: DurableObjectId = env.SHOP.newUniqueId();
        const stub = env.SHOP.get(id) as DurableObjectStub<Shop>;
        await runInDurableObject<DurableObjectStub<Shop>, void>(stub, async (instance, state) => {
            await instance.setup()
            await instance.addOrder({name: 'order1'})
            const result = await instance.completeOrder(1)
            expect(result).toEqual(true)
            const orders = await instance.listOrders()
            expect(orders[0].status).toEqual('completed')
        })
    })

    it('Get a specific order', async () => {
        const id: DurableObjectId = env.SHOP.newUniqueId();
        const stub = env.SHOP.get(id) as DurableObjectStub<Shop>;
        await runInDurableObject<DurableObjectStub<Shop>, void>(stub, async (instance, state) => {
            await instance.setup()
            await instance.addOrder({name: 'order1'})
            const order = await instance.getOrder(1)
            expect(order).toEqual({id: 1, name: 'order1', status: 'pending'})
        })
    })

    it('Setup twice fails', async () => {
        const id: DurableObjectId = env.SHOP.newUniqueId();
        const stub = env.SHOP.get(id) as DurableObjectStub<Shop>;
        await runInDurableObject<DurableObjectStub<Shop>, void>(stub, async (instance, state) => {
            await instance.setup()
            await instance.addOrder({name: 'order1'})
            const result = await instance.setup()
            expect(result).toEqual(undefined)

            const orders = await instance.listOrders()
            expect(orders.length).toEqual(1)
        })
    })
})