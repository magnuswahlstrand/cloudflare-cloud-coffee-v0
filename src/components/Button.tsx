const Button = ({id, list}: { id: number, list: "preparing" | "completed" }) => {

    return <div id={list} hx-swap-oob="beforeend">
        <li> Espresso
            #{id}
        </li>
    </div>
}

export default Button;