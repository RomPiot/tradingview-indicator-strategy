//@version=5

///////////////////////////////////////////////////////////////////////////////////////////////////
//// Definition
///////////////////////////////////////////////////////////////////////////////////////////////////
indicator(title          = "Romain Indicateurs", 
     shorttitle      = "RI", 
     overlay         = true,
     // resolution      = "", 
    // VP
     precision       = 4, 
     linktoseries    = true, 
     max_bars_back   = 1000, 
     max_lines_count = 500)
     

ma(length, type, show) =>
    if (show) 
        type == "SMA" ? ta.sma(close, length) : type == "EMA" ? ta.ema(close, length) : na
        

mar_active  = input.bool(true, "Activer le Ruban Moyenne Mobile")
ma_active  = input.bool(true, "Activer les Moyennes Mobiles")
bb_active = input.bool(true, title="Activer les Bandes de Bollinger")
vp_active = input.bool(true, title="Activer les Volume Profile")


///////////////////////////////////////////////////////////////////////////////////////////////////
//// Ruban Moyennes Mobiles
///////////////////////////////////////////////////////////////////////////////////////////////////

ma1_type   = input.string("EMA", title="MA-1", inline="MA #1", options=["SMA", "EMA"], group="Ruban Moyennes Mobiles")   
ma1_length = input.int(20, "", inline="MA #1", minval=1, group="Ruban Moyennes Mobiles")
ma1_color  = input(#f5eb5d, "", inline="MA #1", group="Ruban Moyennes Mobiles")
ma1_active  = input.bool(true, "", inline="MA #1", group="Ruban Moyennes Mobiles")
ma2_type   = input.string("EMA", title="MA-2", inline="MA #2", options=["SMA", "EMA"], group="Ruban Moyennes Mobiles")
ma2_length = input.int(25, "", inline="MA #2", minval=1, group="Ruban Moyennes Mobiles")
ma2_color  = input(#f5b771, "", inline="MA #2", group="Ruban Moyennes Mobiles")
ma2_active  = input.bool(true, "", inline="MA #2", group="Ruban Moyennes Mobiles")
ma3_type   = input.string("EMA", title="MA-3", inline="MA #3", options=["SMA", "EMA"], group="Ruban Moyennes Mobiles")
ma3_length = input.int(30, "", inline="MA #3", minval=1, group="Ruban Moyennes Mobiles")
ma3_color  = input(#f5b056, "", inline="MA #3", group="Ruban Moyennes Mobiles")
ma3_active  = input.bool(true, "", inline="MA #3", group="Ruban Moyennes Mobiles")
ma4_type   = input.string("EMA", title="MA-4", inline="MA #4", options=["SMA", "EMA"], group="Ruban Moyennes Mobiles")
ma4_length = input.int(35, "", inline="MA #4", minval=1, group="Ruban Moyennes Mobiles")
ma4_color  = input(#f57b4e, "", inline="MA #4", group="Ruban Moyennes Mobiles")
ma4_active  = input.bool(true, "", inline="MA #4", group="Ruban Moyennes Mobiles")
ma5_type   = input.string("EMA", title="MA-5", inline="MA #5", options=["SMA", "EMA"], group="Ruban Moyennes Mobiles")
ma5_length = input.int(40, "", inline="MA #5", minval=1, group="Ruban Moyennes Mobiles")
ma5_color  = input(#f56d58, "", inline="MA #5", group="Ruban Moyennes Mobiles")
ma5_active  = input.bool(true, "", inline="MA #5", group="Ruban Moyennes Mobiles")
ma6_type   = input.string("EMA", title="MA-6", inline="MA #6", options=["SMA", "EMA"], group="Ruban Moyennes Mobiles")
ma6_length = input.int(45, "", inline="MA #6", minval=1, group="Ruban Moyennes Mobiles")
ma6_color  = input(#f57d51, "", inline="MA #6", group="Ruban Moyennes Mobiles")
ma6_active  = input.bool(true, "", inline="MA #6", group="Ruban Moyennes Mobiles")
ma7_type   = input.string("EMA", title="MA-7", inline="MA #7", options=["SMA", "EMA"], group="Ruban Moyennes Mobiles")
ma7_length = input.int(50, "", inline="MA #7", minval=1, group="Ruban Moyennes Mobiles")
ma7_color  = input(#f55151, "", inline="MA #7", group="Ruban Moyennes Mobiles")
ma7_active  = input.bool(true, "", inline="MA #7", group="Ruban Moyennes Mobiles")
ma8_type   = input.string("EMA", title="MA-8", inline="MA #8", options=["SMA", "EMA"], group="Ruban Moyennes Mobiles")
ma8_length = input.int(55, "", inline="MA #8", minval=1, group="Ruban Moyennes Mobiles")
ma8_color  = input(#aa2707, "", inline="MA #8", group="Ruban Moyennes Mobiles")
ma8_active = input.bool(true, "", inline = "MA #8", group = "Ruban Moyennes Mobiles")

plot(mar_active ? ma(ma1_length, ma1_type, ma1_active) : na, title="MA-1", color=ma1_color, linewidth=2)
plot(mar_active ? ma(ma2_length, ma2_type, ma2_active) : na, title="MA-2", color=ma2_color, linewidth=2)
plot(mar_active ? ma(ma3_length, ma3_type, ma3_active) : na, title="MA-3", color=ma3_color, linewidth=2)
plot(mar_active ? ma(ma4_length, ma4_type, ma4_active) : na, title="MA-4", color=ma4_color, linewidth=2)
plot(mar_active ? ma(ma5_length, ma5_type, ma5_active) : na, title="MA-5", color=ma5_color, linewidth=2)
plot(mar_active ? ma(ma6_length, ma6_type, ma6_active) : na, title="MA-6", color=ma6_color, linewidth=2)
plot(mar_active ? ma(ma7_length, ma7_type, ma7_active) : na, title="MA-7", color=ma7_color, linewidth=2)
plot(mar_active ? ma(ma8_length, ma8_type, ma8_active) : na, title="MA-8", color=ma8_color, linewidth=2)


///////////////////////////////////////////////////////////////////////////////////////////////////
//// Moyennes mobiles personnalisées
///////////////////////////////////////////////////////////////////////////////////////////////////

ma9_type   = input.string("EMA", title="MA-9", inline="MA #9", options=["SMA", "EMA"], group="Moyennes Mobiles Personnalisées")
ma9_length = input.int(7, "", inline="MA #9", minval=1, group="Moyennes Mobiles Personnalisées")
ma9_color  = input(#f6c309, "", inline="MA #9", group="Moyennes Mobiles Personnalisées")
ma9_active  = input.bool(true, "", inline="MA #9", group="Moyennes Mobiles Personnalisées")
ma10_type   = input.string("EMA", title="MA-10", inline="MA #10", options=["SMA", "EMA"], group="Moyennes Mobiles Personnalisées")
ma10_length = input.int(100, "", inline="MA #10", minval=1, group="Moyennes Mobiles Personnalisées")
ma10_color  = input(#f6c309, "", inline="MA #10", group="Moyennes Mobiles Personnalisées")
ma10_active  = input.bool(true, "", inline="MA #10", group="Moyennes Mobiles Personnalisées")
ma11_type   = input.string("EMA", title="MA-11", inline="MA #11", options=["SMA", "EMA"], group="Moyennes Mobiles Personnalisées")
ma11_length = input.int(200, "", inline="MA #11", minval=1, group="Moyennes Mobiles Personnalisées")
ma11_color  = input(#f6c309, "", inline="MA #11", group="Moyennes Mobiles Personnalisées")
ma11_active  = input.bool(true, "", inline="MA #11", group="Moyennes Mobiles Personnalisées")
ma12_type   = input.string("EMA", title="MA-12", inline="MA #12", options=["SMA", "EMA"], group="Moyennes Mobiles Personnalisées")
ma12_length = input.int(1000, "", inline="MA #12", minval=1, group="Moyennes Mobiles Personnalisées")
ma12_color  = input(#f6c309, "", inline="MA #12", group="Moyennes Mobiles Personnalisées")
ma12_active  = input.bool(true, "", inline="MA #12", group="Moyennes Mobiles Personnalisées")

plot(ma_active ? ma(ma9_length, ma9_type, ma9_active) : na, title="MA-9", color=ma9_color, linewidth=2)
plot(ma_active ? ma(ma10_length, ma10_type, ma10_active) : na, title="MA-10", color=ma10_color, linewidth=2)
plot(ma_active ? ma(ma11_length, ma11_type, ma11_active) : na, title="MA-11", color=ma11_color, linewidth=2)
plot(ma_active ? ma(ma12_length, ma12_type, ma12_active) : na, title="MA-12", color=ma12_color, linewidth=2)


///////////////////////////////////////////////////////////////////////////////////////////////////
//// Bandes de Bollinger
///////////////////////////////////////////////////////////////////////////////////////////////////

bb_length = input.int(20, minval=1, title="Périodes", group="Bandes de Bollinger")
bb_mult = input.float(2.0, minval=0.001, maxval=50, title="StdDev", group="Bandes de Bollinger")
bb_offset = input.int(0, "Offset", minval = -500, maxval = 500, group="Bandes de Bollinger")
bb_basis = ta.sma(close, bb_length)
bb_dev = bb_mult * ta.stdev(close, bb_length)
bb_upper = bb_basis + bb_dev
bb_lower = bb_basis - bb_dev

bb_p1 = plot(bb_active ? bb_upper : na, "Upper", color=#00FF00, offset = bb_offset)
bb_p2 = plot(bb_active ? bb_lower : na, "Lower", color=#00FF00, offset = bb_offset)
fill(bb_p1, bb_p2, title = "Background", color=color.rgb(0, 255 , 0, 95))


///////////////////////////////////////////////////////////////////////////////////////////////////
//// VOLUME PROFILE (VP)
///////////////////////////////////////////////////////////////////////////////////////////////////

// INPUTS
vp_lookback   = input.int(defval = 200, 
                     title   = "Profondeur des volumes [10-1000]",
                     minval  = 10, 
                     maxval  = 1000, group="Volumes Profiles")

vp_max_bars   = input.int(defval = 100, 
                     title   = "Nombre de barres [10-500]",
                     minval  = 10, 
                     maxval  = 500, group="Volumes Profiles")

vp_bar_mult   = input.int(defval = 50, 
                     title   = "Longueur des barres [10-100]",
                     minval  = 10, 
                     maxval  = 100, group="Volumes Profiles")

vp_bar_offset = input.int(defval = 65, 
                     title   = "Décalage horizontal sur le graphique [0-100]",
                     minval  = 0, 
                     maxval  = 100, group="Volumes Profiles")

vp_bar_width  = input.int(defval = 2, 
                     title   = "Epaisseur des barres [1-20]", 
                     minval  = 1, 
                     maxval  = 20, group="Volumes Profiles")

vp_delta_type = input.string(defval = "All",
                     title   = "Type d'ordres",
                     options = ['All', 'Long', 'Short'], group="Volumes Profiles")

vp_poc_show   = input.bool(defval = false, 
                     title   = "Tracer la ligne majoritaire", group="Volumes Profiles")

vp_bar_color  = input.color(defval = color.new(color.aqua, 20) , 
                     title   = "Couleur des barres", group="Volumes Profiles")

vp_poc_color  = input.color(defval = color.new(color.orange, 20), 
                     title   = "Couleur de la ligne de majoritaire", group="Volumes Profiles")


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
float vp_HH = ta.highest(high, vp_lookback)
float vp_LL = ta.lowest(low, vp_lookback)

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
        int Aj = math.round(vp_bar_mult * Vj / vp_Vmax)
        array.set(vp_a_W, j, Aj)

///////////////////////////////////////////////////////////////////////////////////////////////////
//// PLOTING
///////////////////////////////////////////////////////////////////////////////////////////////////
if barstate.isfirst
    vp_first := time
vp_change = ta.change(time)
vp_x_loc = timenow + math.round(vp_change * vp_bar_offset)
 
f_setup_bar(n) =>
    x1 = ((vp_VmaxId == n) and vp_poc_show) ? math.max(time[vp_lookback], vp_first) : 
		 (timenow + math.round(vp_change * (vp_bar_offset - array.get(vp_a_W, n))))
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