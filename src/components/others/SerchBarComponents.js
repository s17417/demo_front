


export function InputSearchForm(props){
    const className = props.error === '' ? '' : 'error-input'
    const name = props.name
    const errorSpanId = 'error' + name[0].toUpperCase() + name.slice(1)


    return <>
    <label htmlFor={props.name}>
        {props.label}
    </label>
    <input
        autoComplete={props.autoComplete}
        disabled={props.disabled}
        list={props.list}
        ref={props.referential}
        type={props.type}
        className={className}
        name={props.name}
        min={props.min}
        max={props.max}
        group={props.group}
        id={props.name}
        placeholder={props.placeholder}
        value={props.value}
        onKeyDown={props.onKeyDown}       
        onChange={props.onChange}/>
    {props.children}
        <span id={errorSpanId} className="errors-text">{props.error}</span>   
    </>
    
}

export function Datalist(props){
    return <datalist id={props.id}>
        {props.children}
        </datalist>
}

export function InputSearchFormChildren(props){
    const className = props.error === '' ? '' : 'error-input'
    const name = props.name
    const errorSpanId = 'error' + name[0].toUpperCase() + name.slice(1)


    return <>
    <label htmlFor={props.name}>
        {props.label}
    </label>
    <div className="searchbarWithChildren" >
        <input
            readOnly={props.readOnly?true:false}
            disabled={props.disabled?true:false}
            onInput={props.onInput}
            type={props.type}
            className={className}
            name={props.name}
            min={props.min}
            max={props.max}
            group={props.group}
            id={props.name}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange} />
            {props.children}
    </div>
    <span id={errorSpanId} className="errors-text">{props.error}</span>
    </>
}

export function InputTextAreaFormChildren(props){
    const className = props.error === '' ? '' : 'error-input'
    const name = props.name
    const errorSpanId = 'error' + name[0].toUpperCase() + name.slice(1)


    return <>
    <label htmlFor={props.name}>
        {props.label}
    </label>
    <div className="searchbarWithChildren" >
    <textarea
        rows={props.rows?props.rows:10}
        cols={props.cols?props.cols:5}
        autoCapitalize={props.autoCapitalize?props.autoCapitalize:'none'}
        autoComplete={props.autoComplete?props.autoComplete:'off'}
        maxLength={props.maxLength?props.maxLength:100}
        minLength={props.minLength?props.minLength:'0'}
        type={props.type}
        className={className}
        name={props.name}
        id={props.name}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange} />
            {props.children}
    </div>
    <span id={errorSpanId} className="errors-text">{props.error}</span>
    </>
}

export function InputTextArea(props){
    const className = props.error === '' ? '' : 'error-input'
    const name = props.name
    const errorSpanId = 'error' + name[0].toUpperCase() + name.slice(1)


    return <>
    <label htmlFor={props.name}>
        {props.label}
    </label>
    <textarea
        rows={props.rows?props.rows:10}
        cols={props.cols?props.cols:5}
        autoCapitalize={props.autoCapitalize?props.autoCapitalize:'none'}
        autoComplete={props.autoComplete?props.autoComplete:'off'}
        maxLength={props.maxLength?props.maxLength:100}
        minLength={props.minLength?props.minLength:'0'}
        type={props.type}
        className={className}
        name={props.name}
        id={props.name}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange} />
        <span id={errorSpanId} className="errors-text">{props.error}</span>   
    </>
}

export function Select(props){
    const className = props.error === '' ? '' : 'error-input'
    const name = props.name
    const errorSpanId = 'error' + name[0].toUpperCase() + name.slice(1)

    return <>
    <label htmlFor={props.name}>
        {props.label}
    </label>
    <select
        style={props.style}
        defaultValue={props.defaultValue}
        multiple={props.multiple}
        size={props.size}
        disabled={props.disabled}
        autoFocus={props.autoFocus}
        required={props.required}
        className={className}
        name={props.name}
        id={props.name}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
    >
        {props.children}
    </select>
        <span id={errorSpanId} className="errors-text">{props.error}</span>   
    </>
}

export function Option(props){
    return <option
        style={{whiteSpace:"break-spaces", wordWrap:"break-word", overflow:"hidden", maxWidth:'100%'}}
        selected={props.selected}
        key={props.label}
        value={props.value}
        label={props.label}
    />
}