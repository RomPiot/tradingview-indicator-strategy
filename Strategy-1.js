// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © rompiotcrypto

// @version=4
strategy("Strategy 1", overlay=true, margin_long=0, margin_short=0, process_orders_on_close=true)

//═════ CUSTOMIZATION ═════

iop_highcolor  = input(defval=color.gray,   title="High Zones Color",   type=input.color,  inline='customcolor',     group="Chart Customization")
iop_lowcolor   = input(defval=color.gray, title="Low Zones Color",    type=input.color,  inline='customcolor',     group="Chart Customization")

// Background Color Function
iop_highzonescolor  = color(iop_highcolor)
iop_lowzonescolor   = color(iop_lowcolor)

////////////////////////////
//        OrderBlock      //
////////////////////////////

// Inputs
iop_obtype     = input(defval="Price Action", title="OB Detection Type",           type=input.string,  options=['Price Action','Volume'],   group="OrderBlock Settings",          tooltip="OrderBlocks are areas where Banks take a Short or Long position. So they create a movement that they would like to hide from us, but luckily for us they cannot. Take the example of Banks opening Short position for x reason. The Trend is already Bearish. The Price will fall and then make a Reversal (most often to the price where they opened their positions) and it is at this precise moment that they will again resume a Short position twice as large because for the moment, following this example it is not in their interest that the Price exceeds a certain Price since they are Seller. As a result they create a solid Resistance (the strongest it is). There are several ways to interpret this logic, we can try to follow the movement of Banks or on the contrary take advantage of the recovery of the course.")
iop_obline     = input(defval=true,           title="Display OB Lines",            type=input.bool,                                         group="OrderBlock Settings",          tooltip="Displays White Line (by default) according to detected OrderBlock Candle. These lines can indicate a potential recovery area.")
iop_linestyle  = input(defval="Solid",        title="Style",                       type=input.string,  options=['Solid','Dotted','Dashed'], group="OrderBlock Settings",          inline='lines')
iop_linessize  = input(defval=2,              title="Size",                        type=input.integer, minval=1, maxval=2,                  group="OrderBlock Settings",          inline='lines')
iop_maxlines   = input(defval=10,             title="Maximum Lines Displayed",     type=input.integer, minval=1, maxval=100,                group="OrderBlock Settings")
iop_usewick    = input(defval=false,           title="Utiliser les mèches ?",      type=input.bool,                                         group="OrderBlock Settings")
iop_active = input(defval=true,           title="Activer ?",                   type=input.bool,                                         group="OrderBlock Settings",          tooltip="Will display a «Red Arrow» for Bearish OrderBlock and a «Green Arrow» for Bullish OrderBlock. Note that you should not in any way interpret these «Arrows» as Signals to Buy or Sell.")
iop_delay      = input(defval=5,              title="Price Action Offset",         type=input.integer, minval=1,                            group="Advanced OrderBlock Settings", tooltip="Number of Subsequent Candles to count to search for the potential OrderBlock. (Price Action must be selected in the «OB Detection Type» scrolling menu)")
iop_vr         = input(defval=89,             title="Volume Ratio",                type=input.integer, minval=1,                            group="Advanced OrderBlock Settings", tooltip="Highest Volume Ratio to search for the potential OrderBlock. (Volume must be selected in the «OB Detection Type» scrolling menu)")

//Color Call Function

f_obcallc(obcolor, _call) =>
    c1 = color.r(obcolor)
    c2 = color.g(obcolor)
    c3 = color.b(obcolor)
    color.rgb(c1, c2, c3, _call)

//Round Function

round_f(x) => round(x / syminfo.mintick) * syminfo.mintick

//Constant Price Variables

int iop_offset = iop_delay + 1
iop_close_     = iop_obtype == 'Price Action' ? close[iop_offset]     : iop_obtype == 'Volume' ? close     : na
iop_low_       = iop_obtype == 'Price Action' ? low[iop_offset]       : iop_obtype == 'Volume' ? low       : na
iop_high_      = iop_obtype == 'Price Action' ? high[iop_offset]      : iop_obtype == 'Volume' ? high      : na
iop_open_      = iop_obtype == 'Price Action' ? open[iop_offset]      : iop_obtype == 'Volume' ? open      : na
iop_bar_index_ = iop_obtype == 'Price Action' ? bar_index[iop_offset] : iop_obtype == 'Volume' ? bar_index : na

//═════ Price Action ═════ - Original Script : ('Order Block Finder (Experimental)') By Wugamlo => https://tradingview.com/script/R8g2YHdg-Order-Block-Finder-Experimental/

//Constant Price Action Variables

int iop_bearcandle = 0
int iop_bullcandle = 0
int iop_po         = iop_obtype == "Price Action" ? -iop_offset : iop_obtype == "Volume" ? 0 : na

//Bearish/Bullish Candle Detection

for i = 1 to iop_delay
    iop_bullcandle := iop_bullcandle + (close[i] > open[i] ? 1 : 0)
for i = 1 to iop_delay
    iop_bearcandle := iop_bearcandle + (close[i] < open[i] ? 1 : 0)

//Price Action Calculation

iop_abs       = iop_usewick ? abs(open[iop_offset] - close[iop_offset]) / abs(high[iop_offset] - low[iop_offset]) <= 100 / 100 : ((abs(close[iop_offset] - close[1])) / close[iop_offset]) * 100
iop_pabeardir = close[iop_offset] > open[iop_offset]
iop_pabulldir = close[iop_offset] < open[iop_offset]

//Conditions

iop_bearpa = iop_pabeardir and (iop_bearcandle == (iop_delay)) and iop_abs
iop_bullpa = iop_pabulldir and (iop_bullcandle == (iop_delay)) and iop_abs

//Converting Boolean Conditions to Float

var float iop_bearpaprice = na
if iop_bearpa
    iop_bearpaprice := iop_close_
var float iop_bullpaprice = na
if iop_bullpa
    iop_bullpaprice := iop_close_

var iop_is_change_bearpaprice = change(iop_bearpaprice)
var iop_is_change_bullpaprice = change(iop_bullpaprice)

//═════ Volume ═════

//Volume Calculation

iop_absrange   = iop_usewick ? abs(open - close) / abs(high - low) <= 100 / 100 : ((abs(close - close[1])) / close) * 100
iop_hv         = highest(volume, iop_vr)
iop_vabs       = volume * 100 / iop_hv * 4 / 5
iop_smoothing  = ema(iop_vabs, 21)
iop_equal      = iop_vabs - iop_smoothing
iop_cz         = highest(iop_equal, iop_vr) * 0.618
iop_cum        = iop_equal > 0 and iop_equal >= iop_cz
iop_volbeardir = close < open
iop_volbulldir = close > open

//Conditions

iop_bearvol = iop_volbeardir and iop_absrange and iop_cum ? -1 : 0
iop_bullvol = iop_volbulldir and iop_absrange and iop_cum ?  1 : 0

var iop_is_crossunder_bearvol = crossunder(iop_bearvol, 0)
var iop_is_crossover_bullvol = crossover(iop_bullvol, 0) 

//OB Type Conditions

iop_bearob = iop_obtype == "Price Action" ? iop_bearpa : iop_obtype == "Volume" ? iop_bearvol == -1 : na
iop_bullob = iop_obtype == "Price Action" ? iop_bullpa : iop_obtype == "Volume" ? iop_bullvol ==  1 : na

//Conditions Call For Lines Drawings

iop_pivothigh = iop_bearob
iop_pivotlow  = iop_bullob

//Bar Color Setup

iop_obc = iop_pivothigh ? color.new(iop_highzonescolor, 0) : iop_pivotlow ? color.new(iop_lowzonescolor, 0) : na

//Lines Variables

var int     iop_numberofline         = iop_maxlines
var float   iop_bearcandlehigh       = na
var float   iop_bearcandlelow        = na
var float   iop_bullcandlehigh       = na
var float   iop_bullcandlelow        = na
var line[]  iop_bearcandlehighline   = array.new_line(0, na)
var line[]  iop_bearcandlelowline    = array.new_line(0, na)
var line[]  iop_bullcandlehighline   = array.new_line(0, na)
var line[]  iop_bullcandlelowline    = array.new_line(0, na)
var line    iop_bearcandlehigharea   = na
var line    iop_bearcandlelowarea    = na
var line    iop_bullcandlehigharea   = na
var line    iop_bullcandlelowarea    = na
var bool[]  iop_pivhighareaok        = array.new_bool(0, false)
var bool[]  iop_pivlowareaok         = array.new_bool(0, false)
var bool    iop_pivhighok            = false
var bool    iop_pivlowok             = false
var bool    iop_pivtrue              = true
var color   iop_callpivhighc         = iop_highzonescolor
var color   iop_callpivlowc          = iop_lowzonescolor
var label[] iop_fpivhigharray        = array.new_label(0, na)
var label[] iop_fpivlowarray         = array.new_label(0, na)
var label   iop_fbearcandlehigharray = na
var label   iop_fbullcandlelowarray  = na

//Box Variables

var box[] iop_bearboxarray       = array.new_box()
var box[] iop_bullboxarray       = array.new_box()
var color iop_bearboxcolor       = color.new(iop_callpivhighc, 50)
var color iop_bullboxcolor       = color.new(iop_callpivlowc,  50)
var color iop_bearborderboxcolor = color.new(iop_callpivhighc, 50)
var color iop_bullborderboxcolor = color.new(iop_callpivlowc,  50)

//tine Styles Function

f_linestyle(_style) =>
    _style == "Solid" ? line.style_solid : _style == "Dotted" ? line.style_dotted : line.style_dashed

//Bearish OB Lines Calculation

if iop_pivothigh and iop_obline
    iop_bearcandlehigh       := iop_obtype == 'Price Action' ? iop_usewick ? iop_high_ : iop_close_ : iop_obtype == "Volume" ? iop_usewick ? iop_high_ : iop_open_ : na
    iop_bearcandlelow        := iop_close_ < iop_open_ ? iop_close_ : iop_open_
    iop_bearcandlehigharea   := iop_pivtrue   ? line.new(iop_bar_index_, iop_bearcandlehigh, bar_index, iop_bearcandlehigh, width=iop_linessize) : line.new(iop_bar_index_, (iop_bearcandlehigh + iop_bearcandlelow) / 2, bar_index, (iop_bearcandlehigh + iop_bearcandlelow) / 2, width=iop_linessize)
    iop_bearbox               = box.new(iop_bar_index_, na, bar_index, na, bgcolor=iop_bearboxcolor, border_style=line.style_dotted, border_color=iop_bearborderboxcolor)
    if array.size(iop_bearcandlehighline) > iop_numberofline
        line.delete(array.shift(iop_bearcandlehighline))
        line.delete(array.shift(iop_bearcandlelowline))
        array.shift(iop_pivhighareaok)
        label.delete(array.shift(iop_fpivhigharray))
        box.delete(array.shift(iop_bearboxarray))
    array.push(iop_bearcandlehighline, iop_bearcandlehigharea)
    array.push(iop_bearcandlelowline,  iop_bearcandlelowarea)
    array.push(iop_pivhighareaok, false)
    array.push(iop_fpivhigharray, iop_fbearcandlehigharray)
    array.push(iop_bearboxarray,  iop_bearbox)
if array.size(iop_bearcandlelowline) > 0
    for i = 0 to array.size(iop_bearcandlelowline) -1
        line  iop_highlinedelete = array.get(iop_bearcandlehighline, i)
        line  iop_lowlinedelete  = array.get(iop_bearcandlelowline,  i)
        label iop_flinearray     = array.get(iop_fpivhigharray,      i)
        bool  iop_linearrayok    = array.get(iop_pivhighareaok,      i)
        var   iop_boxextend      = array.get(iop_bearboxarray,       i)
        line.set_style(iop_highlinedelete, f_linestyle(iop_linestyle))
        line.set_style(iop_lowlinedelete,  f_linestyle(iop_linestyle))
        line.set_color(iop_highlinedelete,  color.from_gradient(i, 1, iop_numberofline, f_obcallc(iop_callpivhighc, 00), f_obcallc(iop_callpivhighc, 00)))
        line.set_color(iop_lowlinedelete,   color.from_gradient(i, 1, iop_numberofline, f_obcallc(iop_callpivhighc, 00), f_obcallc(iop_callpivhighc, 00)))
        label.set_textcolor(iop_flinearray, color.from_gradient(i, 1, iop_numberofline, f_obcallc(iop_callpivhighc, 00), iop_callpivhighc))
        label.set_text(iop_flinearray, tostring(round_f(line.get_y1(iop_highlinedelete))))
        label.set_x(iop_flinearray, bar_index)
        box.set_right(array.get(iop_bearboxarray, i), bar_index)
        iop_crossbear   = iop_obtype == "Price Action" ? iop_usewick ? high > line.get_y1(iop_highlinedelete) : close > line.get_y1(iop_highlinedelete) : iop_obtype == "Volume" ? iop_usewick ? high > line.get_y1(iop_highlinedelete) : close > line.get_y1(iop_highlinedelete) : na
        iop_oblinecross = iop_crossbear
        if iop_oblinecross and not iop_linearrayok
            array.set(iop_pivhighareaok, i, true)
            label.delete(iop_flinearray)
        else if not iop_linearrayok
            line.set_x2(iop_highlinedelete, bar_index)
            array.set(iop_bearcandlehighline, i, iop_highlinedelete)
            line.set_x2(iop_lowlinedelete,  bar_index)
            array.set(iop_bearcandlelowline,  i, iop_lowlinedelete)

//Bullish OB Lines Calculation

if iop_pivotlow and iop_obline
    iop_bullcandlelow       := iop_obtype == 'Price Action' ? iop_usewick ? iop_low_ : iop_close_ : iop_obtype == "Volume" ? iop_usewick ? iop_low_ : iop_open_ : na
    iop_bullcandlehigh      := iop_close_ < iop_open_ ? iop_open_ : iop_close_
    iop_bullcandlelowarea   := iop_pivtrue   ? line.new(iop_bar_index_, iop_bullcandlelow,  bar_index, iop_bullcandlelow,  width=iop_linessize) : line.new(iop_bar_index_, (iop_bullcandlehigh + iop_bullcandlelow) / 2, bar_index, (iop_bullcandlehigh + iop_bullcandlelow) / 2, width=iop_linessize)
    iop_bullbox              = box.new(iop_bar_index_, na, bar_index, na, bgcolor=iop_bullboxcolor, border_style=line.style_dotted, border_color=iop_bullborderboxcolor)
    if array.size(iop_bullcandlehighline) > iop_numberofline
        line.delete(array.shift(iop_bullcandlehighline))
        line.delete(array.shift(iop_bullcandlelowline))
        array.shift(iop_pivlowareaok)
        label.delete(array.shift(iop_fpivlowarray))
        box.delete(array.shift(iop_bullboxarray))
    array.push(iop_bullcandlehighline, iop_bullcandlehigharea)
    array.push(iop_bullcandlelowline,  iop_bullcandlelowarea)
    array.push(iop_pivlowareaok, false)
    array.push(iop_fpivlowarray, iop_fbullcandlelowarray)
    array.push(iop_bullboxarray, iop_bullbox)
if array.size(iop_bullcandlelowline) > 0
    for i = 0 to array.size(iop_bullcandlelowline) -1
        line  iop_highlinedelete = array.get(iop_bullcandlehighline, i)
        line  iop_lowlinedelete  = array.get(iop_bullcandlelowline,  i)
        label iop_flinearray     = array.get(iop_fpivlowarray,       i)
        bool  iop_linearrayok    = array.get(iop_pivlowareaok,       i)
        var   iop_boxextend      = array.get(iop_bullboxarray,       i)
        line.set_style(iop_highlinedelete, f_linestyle(iop_linestyle))
        line.set_style(iop_lowlinedelete,  f_linestyle(iop_linestyle))
        line.set_color(iop_highlinedelete,  color.from_gradient(i, 1, iop_numberofline, f_obcallc(iop_callpivlowc, 00), f_obcallc(iop_callpivlowc, 00)))
        line.set_color(iop_lowlinedelete,   color.from_gradient(i, 1, iop_numberofline, f_obcallc(iop_callpivlowc, 00), f_obcallc(iop_callpivlowc, 00)))
        label.set_textcolor(iop_flinearray, color.from_gradient(i, 1, iop_numberofline, f_obcallc(iop_callpivlowc, 00), iop_callpivlowc))
        label.set_text(iop_flinearray, tostring(round_f(line.get_y1(iop_lowlinedelete))))
        label.set_x(iop_flinearray, bar_index)
        box.set_right(array.get(iop_bullboxarray, i), bar_index)
        iop_crossbull   = iop_obtype == "Price Action" ? iop_usewick ? low < line.get_y1(iop_lowlinedelete) : close < line.get_y1(iop_lowlinedelete) : iop_obtype == "Volume" ? iop_usewick ? low < line.get_y1(iop_lowlinedelete) : close < line.get_y1(iop_lowlinedelete) : na
        iop_oblinecross = iop_crossbull
        if iop_oblinecross and not iop_linearrayok
            array.set(iop_pivlowareaok, i, true)
            label.delete(iop_flinearray)
        else if not iop_linearrayok
            line.set_x2(iop_highlinedelete, bar_index)
            array.set(iop_bullcandlehighline, i, iop_highlinedelete)
            line.set_x2(iop_lowlinedelete,  bar_index)
            array.set(iop_bullcandlelowline,  i, iop_lowlinedelete)

//Plotting
plotshape(iop_active ? iop_pivothigh : na, title="Bearish OrderBlock", style=shape.triangledown, location=location.abovebar, color=color.new(color.red,   0), size=size.tiny, offset=iop_po)
plotshape(iop_active ? iop_pivotlow  : na, title="Bullish OrderBlock", style=shape.triangleup,   location=location.belowbar, color=color.new(color.green, 0), size=size.tiny, offset=iop_po)
barcolor(iop_obc, offset=iop_po)

//buy sell
if (iop_bearob)
    strategy.entry("My Long Entry Id", strategy.short)
if (iop_bullob)
    strategy.entry("My Long Entry Id", strategy.long)
    
//
// The Fixed Percent Stop Loss Code
// User Options to Change Inputs (%)
iop_stopPer = input(2, title='Stop Loss %', type=input.float) / 100
iop_takePer = input(20, title='Take Profit %', type=input.float) / 100

// Determine where you've entered and in what direction
iop_longStop = strategy.position_avg_price * (1 - iop_stopPer)
iop_shortStop = strategy.position_avg_price * (1 + iop_stopPer)
iop_shortTake = strategy.position_avg_price * (1 - iop_takePer)
iop_longTake = strategy.position_avg_price * (1 + iop_takePer)

if strategy.position_size > 0 
    strategy.exit(id="Close Long", stop=iop_longStop, limit=iop_longTake)
if strategy.position_size < 0 
    strategy.exit(id="Close Short", stop=iop_shortStop, limit=iop_shortTake)

//PLOT FIXED SLTP LINE
plot(strategy.position_size > 0 ? iop_longStop : na, style=plot.style_linebr, color=color.red, linewidth=1, title="Long Fixed SL")
plot(strategy.position_size < 0 ? iop_shortStop : na, style=plot.style_linebr, color=color.red, linewidth=1, title="Short Fixed SL")
plot(strategy.position_size > 0 ? iop_longTake : na, style=plot.style_linebr, color=color.green, linewidth=1, title="Long Take Profit")
plot(strategy.position_size < 0 ? iop_shortTake : na, style=plot.style_linebr, color=color.green, linewidth=1, title="Short Take Profit")