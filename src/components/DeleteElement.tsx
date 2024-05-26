const DeleteElement = ({id}: { id: string }) => {
    return <li target={`.preparing>#{id}`} hx-swap-oob="delete">foo</li>
}

export default DeleteElement;