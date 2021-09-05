//@version=4
// TODO : voir les niveau de vente et achat par couleur bleu et jaune
///////////////////////////////////////////////////////////////////////////////////////////////////
//// STUDY
///////////////////////////////////////////////////////////////////////////////////////////////////
study(title          = "Romain Indicateurs", 
     shorttitle      = "CI", 
     overlay         = true,
     // resolution      = "",
    // VP
     precision       = 4, 
     linktoseries    = true, 
     max_bars_back   = 1000, 
     max_lines_count = 500)
     

///////////////////////////////////////////////////////////////////////////////////////////////////
//// MOVING AVERAGE 50 (MA 50)
///////////////////////////////////////////////////////////////////////////////////////////////////
ma_50_active = input(title="Activer la Moyenne Mobile 50 (MA 50)", type=input.bool, defval=true)
ma_50_out = sma(close, 50)

plot(ma_50_active ? ma_50_out : na, color=color.orange, linewidth=2, title="MA", offset=0)


///////////////////////////////////////////////////////////////////////////////////////////////////
//// MOVING AVERAGE 20 (MA 20)
///////////////////////////////////////////////////////////////////////////////////////////////////
ma_20_active = input(title="Activer la Moyenne Mobile 20 (MA 20)", type=input.bool, defval=true)
ma_20_out = sma(close, 20)

plot(ma_20_active ? ma_20_out : na, color=color.yellow, linewidth=2, title="MA", offset=0)


///////////////////////////////////////////////////////////////////////////////////////////////////
//// MOVING AVERAGE (MA)
///////////////////////////////////////////////////////////////////////////////////////////////////
ma_active = input(title="Activer la Moyenne Mobile personnalisé (MA)", type=input.bool, defval=true)
ma_len = input(9, minval=1, title="MA : Longueur")
ma_src = input(close, title="MA : Source")
ma_offset = input(title="MA : Offset", type=input.integer, defval=0, minval=-500, maxval=500)
ma_out = sma(ma_src, ma_len)

plot(ma_active ? ma_out : na, color=color.red, linewidth=2, title="MA", offset=ma_offset)


///////////////////////////////////////////////////////////////////////////////////////////////////
//// MOVING AVERAGE RIBBON (MAR)
///////////////////////////////////////////////////////////////////////////////////////////////////


mar_active = input(title="Activer le Ruban Moyennes Mobiles (MAR)", type=input.bool, defval=true)

plot(mar_active ? ema(close, 20) : na, title="MA-1", color=#f5eb5d, linewidth=2)
plot(mar_active ? ema(close, 25) : na, title="MA-2", color=#f5b771, linewidth=2)
plot(mar_active ? ema(close, 30) : na, title="MA-3", color=#f5b056, linewidth=2)
plot(mar_active ? ema(close, 35) : na, title="MA-4", color=#f57b4e, linewidth=2)
plot(mar_active ? ema(close, 40) : na, title="MA-5", color=#f56d58, linewidth=2)
plot(mar_active ? ema(close, 45) : na, title="MA-6", color=#f57d51, linewidth=2)
plot(mar_active ? ema(close, 50) : na, title="MA-7", color=#f55151, linewidth=2)
plot(mar_active ? ema(close, 55) : na, title="MA-8", color=#aa2707, linewidth=2)



///////////////////////////////////////////////////////////////////////////////////////////////////
//// Bollinger Bands (BB)
///////////////////////////////////////////////////////////////////////////////////////////////////

bb_active = input(title="Activer les Bandes de Bollinger (BB)", type=input.bool, defval=true)
bb_length = input(20, minval=1, title="BB : Longueur")
bb_src = input(close, title="BB : Source")
bb_mult = input(2.0, minval=0.001, maxval=50, title="BB : StdDev")
bb_offset = input(0, "BB : Offset", type = input.integer, minval = -500, maxval = 500)
bb_basis = sma(bb_src, bb_length)
bb_dev = bb_mult * stdev(bb_src, bb_length)
bb_upper = bb_basis + bb_dev
bb_lower = bb_basis - bb_dev

// plot(bb_active ? bb_basis : na, "Basis", color=#FF6D00, offset = bb_offset)
bb_p1 = plot(bb_active ? bb_upper : na, "Upper", color=#00FF00, offset = bb_offset)
bb_p2 = plot(bb_active ? bb_lower : na, "Lower", color=#00FF00, offset = bb_offset)
fill(bb_p1, bb_p2, title = "Background", color=color.rgb(0, 255 , 0, 95))


///////////////////////////////////////////////////////////////////////////////////////////////////
//// VOLUME PROFILE (VP)
///////////////////////////////////////////////////////////////////////////////////////////////////

// INPUTS
vp_active = input(title="Activer les Volume Profile", type=input.bool, defval=true)
vp_lookback   = input(defval = 200, 
                     title   = "Volume Lookback Depth [10-1000]", 
                     type    = input.integer, 
                     minval  = 10, 
                     maxval  = 1000)

vp_max_bars   = input(defval = 100, 
                     title   = "Number of Bars [10-500]",
                     type    = input.integer, 
                     minval  = 10, 
                     maxval  = 500)

vp_bar_mult   = input(defval = 50, 
                     title   = "Bar Length Multiplier [10-100]",
                     type    = input.integer, 
                     minval  = 10, 
                     maxval  = 100)

vp_bar_offset = input(defval = 65, 
                     title   = "Bar Horizontal Offset [0-100]", 
                     type    = input.integer, 
                     minval  = 0, 
                     maxval  = 100)

vp_bar_width  = input(defval = 2, 
                     title   = "Bar Width [1-20]", 
                     type    = input.integer, 
                     minval  = 1, 
                     maxval  = 20)

// As suggested by @NXT2017
vp_delta_type = input(defval = "Both",
                     title   = "Delta Type",
                     type    = input.string,
                     options = ['Both', 'Bullish', 'Bearish'])

vp_poc_show   = input(defval = false, 
                     title   = "Show POC Line", 
                     type    = input.bool)

vp_bar_color  = input(defval = color.new(color.aqua, 20) , 
                     title   = "Bar Color", 
                     type    = input.color)

vp_poc_color  = input(defval = color.new(color.orange, 20), 
                     title   = "POC Color", 
                     type    = input.color)


///////////////////////////////////////////////////////////////////////////////////////////////////
//// VARIABLES
///////////////////////////////////////////////////////////////////////////////////////////////////
float vp_Vmax = 0.0
int vp_VmaxId = 0
int vp_N_BARS = vp_max_bars

var int vp_first = time

vp_a_P = array.new_float((vp_N_BARS + 1), 0.0)
vp_a_V = array.new_float(vp_N_BARS, 0.0)
vp_a_D = array.new_float(vp_N_BARS, 0.0)
vp_a_W = array.new_int(vp_N_BARS, 0)

///////////////////////////////////////////////////////////////////////////////////////////////////
//// CALCULATIONS
///////////////////////////////////////////////////////////////////////////////////////////////////
float vp_HH = highest(high, vp_lookback)
float vp_LL = lowest(low, vp_lookback)

if barstate.islast
	float vp_HL = (vp_HH - vp_LL) / vp_N_BARS
    for j = 1 to (vp_N_BARS + 1)
        array.set(vp_a_P, (j-1), (vp_LL + vp_HL * j))
	for i = 0 to (vp_lookback - 1)
		int Dc = 0
		array.fill(vp_a_D, 0.0)
		for j = 0 to (vp_N_BARS - 1)
			float Pj = array.get(vp_a_P, j)
			if low[i] < Pj and high[i] > Pj and (vp_delta_type == "Bullish" ? 
			 close[i] >= open[i] : (vp_delta_type == "Bearish" ? close[i] <= open[i] : true))
				float Dj = array.get(vp_a_D, j)
				float dDj = Dj + nz(volume[i])
				array.set(vp_a_D, j, dDj)
				Dc := Dc + 1
		for j = 0 to (vp_N_BARS - 1)
			float Vj = array.get(vp_a_V, j)
			float Dj = array.get(vp_a_D, j)
			float dVj = Vj + ((Dc > 0) ? (Dj / Dc) : 0.0)
			array.set(vp_a_V, j, dVj)
	vp_Vmax := array.max(vp_a_V)
    vp_VmaxId := array.indexof(vp_a_V, vp_Vmax)
    for j = 0 to (vp_N_BARS - 1)
        float Vj = array.get(vp_a_V, j)
        int Aj = round(vp_bar_mult * Vj / vp_Vmax)
        array.set(vp_a_W, j, Aj)

///////////////////////////////////////////////////////////////////////////////////////////////////
//// PLOTING
///////////////////////////////////////////////////////////////////////////////////////////////////
if barstate.isfirst
    vp_first := time
vp_change = change(time)
vp_x_loc = timenow + round(vp_change * vp_bar_offset)

f_setup_bar(n) =>
    x1 = ((vp_VmaxId == n) and vp_poc_show) ? max(time[vp_lookback], vp_first) : 
		 (timenow + round(vp_change * (vp_bar_offset - array.get(vp_a_W, n))))
	ys = array.get(vp_a_P, n)
    line.new(x1     = x1, 
             y1     = ys, 
             x2     = vp_x_loc, 
             y2     = ys, 
             xloc   = xloc.bar_time, 
             extend = extend.none, 
             color  = (vp_VmaxId == n ? vp_poc_color : vp_bar_color), 
             style  = line.style_solid, 
             width  = vp_bar_width)

if barstate.islast
    for i = 0 to (vp_N_BARS - 1) by 1
        vp_active ? f_setup_bar(i) : na
   
///////////////////////////////////////////////////////////////////////////////////////////////////
//// END
///////////////////////////////////////////////////////////////////////////////////////////////////
