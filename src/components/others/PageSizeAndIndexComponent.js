

export default function PageSizeAndIndexComponent({elementCount,totalPages, currentPage, onPageClick, onPageSizeSelection: onPageSizeSelection, pageSizeArray}){
	const elementsCount = elementCount?elementCount:6; 

	const list= totalPages<elementsCount&&totalPages>1 ? 
		Array(totalPages-2).fill(0).map ((_,i) =>i+2) :
			currentPage+1+elementsCount/2>=totalPages ?
				Array(elementsCount-1).fill(0).map ((_,i) => totalPages-elementsCount+1+i) :
				currentPage+1<=elementsCount/2 ? Array(elementsCount-1).fill(0).map ((_,i) =>i+2) : 
					Array(elementsCount-1).fill(0).map ((_,i) =>currentPage-elementsCount/2+i+2);
	
	return <div className='pageBox'>
	<div><button key={1}
		onClick={() =>onPageClick(0)} 
		className={currentPage+1!=1 ? 'page-change-button':'page-current-button'}
	>
	{1}
	</button>
	
    	
	{totalPages>1 ? list.map(p => 
		<button key={p}
			onClick={() =>onPageClick(p-1)} 
			className={currentPage!=p-1 ? 'page-change-button':'page-current-button'}
		>
		{p}
		</button>
		) :
        ''
	}
    {totalPages>1 ?
	<button key={totalPages}
	onClick={() =>onPageClick(totalPages-1)}
	className={currentPage+1!=totalPages ? 'page-change-button':'page-current-button'}
	>
	{totalPages}
	</button> :
    ''
    }
    </div>

	<select className="pageSelect" onChange={onPageSizeSelection}>
        {pageSizeArray.map( v => <option value={v} key={v}>{v}</option>)}
	</select>
</div>
}