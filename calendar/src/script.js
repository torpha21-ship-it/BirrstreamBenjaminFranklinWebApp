const getElemt = (elem) => {
	return document.querySelector(elem)
}
const createElemt = (elem) => {
	return document.createElement(elem)
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const days = ['日', '一','二','三','四','五','六']
const en = ['sunday', 'monday','tuseday','wednesday','thursday','friday','saturday']
const today = new Date()
const yy = today.getFullYear()
const mm = today.getMonth()
const dt = today.getDate()
const dy = today.getDay()

function render (){
	getElemt('.header p').innerHTML = `${yy}`
	getElemt('.month').innerHTML = `
		<p>${mm + 1}</p>
		<p>${months[mm].substring(0, 3)}</p>`
	getElemt('.date').innerHTML = `${dt}`
	getElemt('.fullMonth .title').innerHTML = `${months[mm]}`
	getElemt('.week .day').innerHTML = `星期${days[dy]}`
	getElemt('.week .en').innerHTML = `${en[dy]}`
	calendar(yy, mm)

	// 開關燈
	const btn = getElemt('#btn')
	btn.addEventListener('click', () => {
		if( btn.checked ) {
			getElemt('body').classList.add('active')
		} else {
			getElemt('body').classList.remove('active')
		}
	})
	
}
render()

// -----------------------------------------------------------------------
// 電子鐘
// -----------------------------------------------------------------------
function timer (){
	let newTime = new Date()
	let h = newTime.getHours()
	let m = newTime.getMinutes()
	let s = newTime.getSeconds()
	let hour = ((h < 10) ? '0' : '') + h
	let min = ((m < 10) ? '0' : '') + m
	let sec = ((s < 10) ? '0' : '') + s
	
	getElemt('.timer').innerHTML = `${hour}:${min}:${sec}`
}
setInterval(timer, 1000)
// -----------------------------------------------------------------------
// 小月曆
// 參考資料：https://link.medium.com/1UTiIVbCP8
// -----------------------------------------------------------------------
function calendar (year, month){
	let firstDay = (new Date(year, month)).getDay() // 取得當月第一天
	let date = 1 // 當月第一天/日期，起始值
	for( let r=0; r<6; r++ ) { // 最多6行
		let row = createElemt('tr')
		let cell, cellText
		
		for ( let i=0; i<7; i++) { // 一星期7天，最多7列
			if( r === 0 && i < firstDay ) { // 第0列，且當週 < 7天，填補空格
				cell = createElemt('td')
				row.appendChild(cell)
				
			} else if ( date > daysInMonth(month, year) ) {
				break	// 若當天日期 > 當月最後一天，跳出現在迴圈
				
			} else {
				cell = createElemt('td')
				cellText = document.createTextNode(date) // 補上空格並填入日期
				
				if( year === yy && month === mm && date === dt ) {
					cell.classList.add('now') // 今天日期加上 now
				}
				cell.appendChild(cellText)
				row.appendChild(cell)
				date ++
			}
		}
		getElemt('.fullMonth table').appendChild(row)
	} 
}

// 取得當月份總天數
function daysInMonth(m, y) {
    return 32 - new Date(y, m, 32).getDate()
		// 當月的第32天 - 當天日期 = 當月最後一天
		// 舉栗：8月的第32天為9/1，32-1=31
		// 得到8月的最後一天為31號，當月有31天
}

// -----------------------------------------------------------------------
// 農曆日期
// 參考資料：https://blog.jjonline.cn/userInterFace/173.html
// -----------------------------------------------------------------------
// 各年份閏月大小轉換表
const lunarData = [
'0x04bd8','0x04ae0','0x0a570','0x054d5','0x0d260','0x0d950','0x16554','0x056a0','0x09ad0','0x055d2', //1900-1909
'0x04ae0','0x0a5b6','0x0a4d0','0x0d250','0x1d255','0x0b540','0x0d6a0','0x0ada2','0x095b0','0x14977', //1910-1919
'0x04970','0x0a4b0','0x0b4b5','0x06a50','0x06d40','0x1ab54','0x02b60','0x09570','0x052f2','0x04970', //1920-1929
'0x06566','0x0d4a0','0x0ea50','0x06e95','0x05ad0','0x02b60','0x186e3','0x092e0','0x1c8d7','0x0c950', //1930-1939
'0x0d4a0','0x1d8a6','0x0b550','0x056a0','0x1a5b4','0x025d0','0x092d0','0x0d2b2','0x0a950','0x0b557', //1940-1949
'0x06ca0','0x0b550','0x15355','0x04da0','0x0a5b0','0x14573','0x052b0','0x0a9a8','0x0e950','0x06aa0', //1950-1959
'0x0aea6','0x0ab50','0x04b60','0x0aae4','0x0a570','0x05260','0x0f263','0x0d950','0x05b57','0x056a0', //1960-1969
'0x096d0','0x04dd5','0x04ad0','0x0a4d0','0x0d4d4','0x0d250','0x0d558','0x0b540','0x0b6a0','0x195a6', //1970-1979
'0x095b0','0x049b0','0x0a974','0x0a4b0','0x0b27a','0x06a50','0x06d40','0x0af46','0x0ab60','0x09570', //1980-1989
'0x04af5','0x04970','0x064b0','0x074a3','0x0ea50','0x06b58','0x055c0','0x0ab60','0x096d5','0x092e0', //1990-1999
'0x0c960','0x0d954','0x0d4a0','0x0da50','0x07552','0x056a0','0x0abb7','0x025d0','0x092d0','0x0cab5', //2000-2009
'0x0a950','0x0b4a0','0x0baa4','0x0ad50','0x055d9','0x04ba0','0x0a5b0','0x15176','0x052b0','0x0a930', //2010-2019
'0x07954','0x06aa0','0x0ad50','0x05b52','0x04b60','0x0a6e6','0x0a4e0','0x0d260','0x0ea65','0x0d530', //2020-2029
'0x05aa0','0x076a3','0x096d0','0x04afb','0x04ad0','0x0a4d0','0x1d0b6','0x0d250','0x0d520','0x0dd45', //2030-2039
'0x0b5a0','0x056d0','0x055b2','0x049b0','0x0a577','0x0a4b0','0x0aa50','0x1b255','0x06d20','0x0ada0', //2040-2049
'0x14b63','0x09370','0x049f8','0x04970','0x064b0','0x168a6','0x0ea50','0x06b20','0x1a6c4','0x0aae0', //2050-2059
'0x0a2e0','0x0d2e3','0x0c960','0x0d557','0x0d4a0','0x0da50','0x05d55','0x056a0','0x0a6d0','0x055d4', //2060-2069
'0x052d0','0x0a9b8','0x0a950','0x0b4a0','0x0b6a6','0x0ad50','0x055a0','0x0aba4','0x0a5b0','0x052b0', //2070-2079
'0x0b273','0x06930','0x07337','0x06aa0','0x0ad50','0x14b55','0x04b60','0x0a570','0x054e4','0x0d160', //2080-2089
'0x0e968','0x0d520','0x0daa0','0x16aa6','0x056d0','0x04ae0','0x0a9d4','0x0a2d0','0x0d150','0x0f252', //2090-2099
'0x0d520'] //2100
getElemt('.week .lunar').innerHTML = `農${lunarDate()}`

// 農曆天數
function lunarYear (y) {
		let sum = 348
		for( let i=0x8000; i>0x8; i>>=1 ) {  // >>= 右移賦值
			sum += (lunarData[y-1900] & i) ? 1 : 0 
		}
		return(sum+lunarDays(y))
}

// 當年閏月月份
function lunarMonth (y) {
		return(lunarData[y-1900] & 0xf);
}
// 當年閏月天數
function lunarDays (y) {
		if(lunarMonth(y))  {
				return((lunarData[y-1900] & 0x10000) ? 30 : 29)
		}
		return(0)
}

// 回傳農曆非閏月天數
function monthDays (y,m) {
		if( m > 12 || m < 1 ) { return -1 } //月份1-12，錯誤回傳-1
		return( (lunarData[y-1900] & (0x10000>>m) ) ? 30 : 29 )
}

// 農曆日期
function lunarDate(y, m, d) {
    // 年份限定、上限
    if (y < 1900 || y > 2100) {
        return -1 // undefined 轉換為數字變為 NaN
    }
    // 未傳參數 獲得當天
    if (!y) {
        var newDay = new Date()
    } else {
        var newDay = new Date(y, parseInt(m) - 1, d)
    }
	
    var i, leap, temp = 0
    var offset = (Date.UTC(newDay.getFullYear(), newDay.getMonth(), newDay.getDate()) - Date.UTC(1900, 0, 31)) / 86400000
    for (i = 1900; i < 2101 && offset > 0; i++) {
        temp = lunarYear(i)
        offset -= temp
    }
    if (offset < 0) {
        offset += temp
        i--
    }

    // 農曆年
    var year = i
    var leap = lunarMonth(i) // 閏哪個月
    var isLeap = false

    // 檢驗閏月
    for (i = 1; i < 13 && offset > 0; i++) {
        // 閏月
        if (leap > 0 && i == (leap + 1) && isLeap == false) {
            --i
            isLeap = true
            temp = lunarDays(year) // 計算農曆閏月天數
        } else {
            temp = monthDays(year, i) // 計算農曆普通天數
        }
        // 解除閏月
        if (isLeap == true && i == (leap + 1)) {
            isLeap = false
        }
        offset -= temp
    }
    // 閏月造成的重複月數(?)
    if (offset == 0 && leap > 0 && i == leap + 1) {
        if (isLeap) {
            isLeap = false
        } else {
            isLeap = true
            --i
        }
    }
    if (offset < 0) {
        offset += temp
        --i
    }
    
    var month = i // 農曆月
    var day = offset + 1 // 農曆日
		
    return `${month}-${day}`
}
