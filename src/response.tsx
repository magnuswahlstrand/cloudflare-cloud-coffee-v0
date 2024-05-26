import ProgressBar from "./components/ProgressBar";
import Order from "./components/Order";
import DeleteElement from "./components/DeleteElement";

const MAX_ORDERS = 400

export function atOrderAdded(orderId: number, numPendingOrders: number) {
    return <>
        <ProgressBar current={numPendingOrders} max={MAX_ORDERS}/>
        <div id={"pending"} hx-swap-oob="beforeend">
            <Order id={orderId} actions={["cancel", "complete"]}/>
        </div>
    </>

}

export function atOrderCompleted(orderId: number, numPendingOrders: number) {
    return <>
        <ProgressBar current={numPendingOrders} max={MAX_ORDERS}/>
        <DeleteElement id={`order-${orderId}`}/>
        <div id={"completed"} hx-swap-oob="beforeend">
            <Order id={orderId} actions={[]}/>
        </div>
    </>
}