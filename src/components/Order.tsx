type Action = "cancel" | "make" | "complete"
const Order = ({id, actions}: { id: number, actions: Action[] }) => {
    return <li id={`order-${id}`} className="order">
        <div>
            #{id}
        </div>
        <div class="buttons">
            {actions.includes("cancel")
                && <button hx-swap="delete" hx-target="closest .order"
                           hx-post={`http://localhost:8787/shop/abc/order/${id}/cancel`}>Cancel
                </button>}
            {actions.includes("make")
                && <button hx-swap="delete" hx-target="closest .order"
                           hx-post={`http://localhost:8787/shop/abc/order/${id}/make`}>Make
                </button>}
            {actions.includes("complete")
                && <button hx-swap="delete" hx-target="closest .order"
                           hx-post={`http://localhost:8787/shop/abc/order/${id}/complete`}>Ready
                </button>}
        </div>
    </li>
}

export default Order;