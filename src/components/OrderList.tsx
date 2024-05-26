import {FC} from "hono/jsx";
import {OrderData} from "../orders";
import Order from "./Order";

type Props = {
    orders: OrderData[]
    mode: "waiting" | "pending" | "completed"
}

export const OrderList: FC<Props> = ({orders, mode}) => {
    return <ul className="flex-item-fill" id="pending">
        {orders.map(order => <Order
            id={order.id} actions={["cancel", "complete"]}/>)}
    </ul>
}

