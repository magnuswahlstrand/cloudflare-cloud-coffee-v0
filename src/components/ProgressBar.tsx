const ProgressBar = ({current, max}: { current: number, max: number }) => {
    const message = current <= 0 ? 'No' : `${max - current}`
    return <div id="progress-bar" hx-swap-oob="true">
        <progress value={`${current}`} max={max}>100%</progress>
        <span>${message} drink(s) remaining</span>
    </div>
}

export default ProgressBar;