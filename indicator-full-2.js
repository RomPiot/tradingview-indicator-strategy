//@version=5
indicator(title="Indicator Full 2", shorttitle="IF", format=format.price, precision=2)

rsi_active  = input.bool(true, title="Activer le RSI")
marketcap_rsi_active  = input.bool(true, title="Activer le RSI Marketcap")
macd_active  = input.bool(true, title="Activer le MACD")
soc_active  = input.bool(true, title="Activer le Stochastique")
flow_active  = input.bool(true, title="Activer le Volume Flow")
marketcap_oscillator_active  = input.bool(true, title="Activer le Marketcap Oscillator")
color_high_low  = input(#9C27B0, "Couleur des bandes hautes et basse")
color_middle  = input(#BA68C8, "Couleur centrale")


securityNoRepaint(sym, tf, src) =>
    request.security(sym, tf, src[barstate.isrealtime ? 1 : 0])[barstate.isrealtime ? 0 : 1]
  
    
///////////////////////////////////////////////////////////////////////////////////////////////////
//// RSI
///////////////////////////////////////////////////////////////////////////////////////////////////

rsi_bands = rsi_active ? true : marketcap_rsi_active ? true : false

// hlines
plot(rsi_bands ? 70 : na, 'High', color=color_high_low, linewidth=1)
hline(rsi_bands ? 50 : na, 'Medium', color=color_middle, linewidth=1)
plot(rsi_bands ? 30 : na, 'Low', color=color_high_low, linewidth=1)

// inputs
period_length = input.int(21, 'Period', inline="rsi", group = 'RSI')
rsi_color  = input(color.yellow, "", inline="rsi", group="RSI")
  
current_cap = securityNoRepaint('', timeframe.period, close)
rsi_current = ta.rsi(current_cap, period_length)
plot(rsi_active ? rsi_current : na, 'RSI', color=rsi_color, linewidth=2)


///////////////////////////////////////////////////////////////////////////////////////////////////
//// Marketcap
///////////////////////////////////////////////////////////////////////////////////////////////////

// inputs
leader_market_cap = input.symbol(title='BTC Market Cap', inline="leader_market_cap", defval='CRYPTOCAP:BTC', group='Market Cap')
leader_market_cap_color  = input(color.orange, "", inline="leader_market_cap", group="Market Cap")
alt_market_cap = input.symbol(title='Altcoin Market Cap', inline="alt_market_cap", defval='CRYPTOCAP:TOTAL3', group='Market Cap')
alt_market_cap_color  = input(color.blue, "", inline="alt_market_cap", group="Market Cap")

// Get BTC & alt market caps
leader_cap = securityNoRepaint(leader_market_cap, timeframe.period, close)
alt_cap = securityNoRepaint(alt_market_cap, timeframe.period, close)

// RSI
rsi_leader = ta.rsi(leader_cap, period_length)
rsi_alt = ta.rsi(alt_cap, period_length)

// Plot
plot(marketcap_rsi_active ? rsi_leader : na, 'BTC Marketcap RSI', color=leader_market_cap_color, linewidth=2)
plot(marketcap_rsi_active ? rsi_alt : na, 'Altcoin  Marketcap RSI', color=alt_market_cap_color, linewidth=2)


///////////////////////////////////////////////////////////////////////////////////////////////////
//// MACD
///////////////////////////////////////////////////////////////////////////////////////////////////

// Getting inputs
macd_fast_length = input(title="Fast Length", defval=12, group="MACD")
macd_slow_length = input(title="Slow Length", defval=26, group="MACD")
macd_signal_length = input.int(title="Signal Smoothing",  minval = 1, maxval = 50, defval = 9, group="MACD")
macd_sma_source = input.string(title="Oscillator MA Type",  defval="EMA", options=["SMA", "EMA"], group="MACD")
macd_sma_signal = input.string(title="Signal Line MA Type", defval="EMA", options=["SMA", "EMA"], group="MACD")

// Plot colors
macd_col_macd = input(#2962FF, "MACD Line??????", inline="MACD", group="MACD")
macd_col_signal = input(#FF6D00, "Signal Line??????", inline="Signal", group="MACD")
macd_col_grow_above = input(#26A69A, "Above?????????Grow", inline="Above", group="MACD")
macd_col_fall_above = input(#B2DFDB, "Fall", inline="Above", group="MACD")
macd_col_grow_below = input(#FFCDD2, "Below???Grow", inline="Below", group="MACD")
macd_col_fall_below = input(#FF5252, "Fall", inline="Below", group="MACD")

// Calculating
macd_fast_ma = macd_sma_source == "SMA" ? ta.sma(close, macd_fast_length) : ta.ema(close, macd_fast_length)
macd_slow_ma = macd_sma_source == "SMA" ? ta.sma(close, macd_slow_length) : ta.ema(close, macd_slow_length)
macd_macd = macd_fast_ma - macd_slow_ma
macd_signal = macd_sma_signal == "SMA" ? ta.sma(macd_macd, macd_signal_length) : ta.ema(macd_macd, macd_signal_length)
macd_hist = macd_macd - macd_signal

plot(macd_active ? macd_hist : na, title="Histogram", style=plot.style_columns, color=(macd_hist>=0 ? (macd_hist[1] < macd_hist ? macd_col_grow_above : macd_col_fall_above) : (macd_hist[1] < macd_hist ? macd_col_grow_below : macd_col_fall_below)))
plot(macd_active ? macd_macd : na, title="MACD", color=macd_col_macd)
plot(macd_active ? macd_signal : na, title = "Signal", color = macd_col_signal)


///////////////////////////////////////////////////////////////////////////////////////////////////
//// Stochastic
///////////////////////////////////////////////////////////////////////////////////////////////////

stoch_periodK = input.int(14, title="Period", minval=1, group='Stochastic')
stoch_smoothK = input.int(1, title="%K Smoothing", inline="K Smoothing", minval=1, group='Stochastic')
stoch_k_color  = input(#2962FF, "", inline="K Smoothing", group="Stochastic")
stoch_periodD = input.int(3, title = "%D Smoothing", inline="D Smoothing", minval = 1, group = 'Stochastic')
stoch_d_color  = input(#FF6D00, "", inline="D Smoothing", group="Stochastic")
stoch_k = ta.sma(ta.stoch(close, high, low, stoch_periodK), stoch_smoothK)
stoch_d = ta.sma(stoch_k, stoch_periodD)
plot(soc_active ? stoch_k : na, title="%K", color=stoch_k_color, linewidth=2)
plot(soc_active ? stoch_d : na, title="%D", color=stoch_d_color, linewidth=2)
stoch_h0 = plot(soc_active ? 80 : na, "High", color =color_high_low, linewidth=1)
stoch_hm = hline(soc_active ? 50 : na, "Medium", color=color_middle)
stoch_h1 = plot(soc_active ? 20 : na, "Low", color=color_high_low, linewidth=1)
// fill(stoch_h0, stoch_h1, color=color.rgb(33, 150, 243, 90), title="Background", group='Stochastic')


///////////////////////////////////////////////////////////////////////////////////////////////////
//// Volume Flow
///////////////////////////////////////////////////////////////////////////////////////////////////

flow_length = input.int(130, title="VFI length", inline="flow_length", group='Volume Flow')
vfi_color  = input(color.green, "", inline="flow_length", group="Volume Flow")
flow_coef = input.float(0.2, group='Volume Flow')
flow_v_coef = input.float(2.5, title="Max. vol. cutoff", group='Volume Flow')
flow_signalLength=input.int(5, title="signalLength", inline="flow_signalLength", group='Volume Flow')
vfima_color  = input(color.orange, "", inline="flow_signalLength", group="Volume Flow")
rsi_baseline  = input(color.gray, "Baseline color", inline="rsi", group="Volume Flow")

ma(x,y) => x

typical=hlc3
inter = math.log( typical ) - math.log( typical[1] )
vinter = ta.stdev(inter, 30 )
cutoff = flow_coef * vinter * close
vave = ta.sma( volume, flow_length )[1]
vmax = vave * flow_v_coef
vc = volume < vmax ? volume : vmax //min( volume, vmax )
mf = typical - typical[1]
vcp = mf > cutoff ? vc : mf < -cutoff ? -vc :  0

vfi = ma(math.sum( vcp , flow_length )/vave, 3)
vfima=ta.ema( vfi, flow_signalLength )

plot(flow_active ? 0 : na, color=rsi_baseline, style=plot.style_line, linewidth=2)
plot(flow_active ? vfima : na, title="EMA of vfi", color=vfima_color, linewidth=2)
plot(flow_active ? vfi: na, title="vfi", color=vfi_color, linewidth=2)


///////////////////////////////////////////////////////////////////////////////////////////////////
//// Marketcap Oscillator
///////////////////////////////////////////////////////////////////////////////////////////////////

market_cap_oscillator  = input.int(100, "Oscillator", group="Market Cap")

// calculate
leader_oscillator = market_cap_oscillator - leader_cap[period_length] / leader_cap * 100
alt_oscillator = market_cap_oscillator - alt_cap[period_length] / alt_cap * 100
custom_oscillator = market_cap_oscillator - current_cap[period_length] / current_cap * 100

marketcap_oscillator_high = 20
marketcap_oscillator_medium = 0
marketcap_oscillator_low = -20

// plot BTC and Alt market cap 
grad = color.from_gradient(marketcap_oscillator_active ? custom_oscillator : na, marketcap_oscillator_low, marketcap_oscillator_high, color.lime, color.red)
plot(marketcap_oscillator_active ? leader_oscillator : na, color=leader_market_cap_color, title='BTC Marketcap Oscillator', linewidth=2)
plot(marketcap_oscillator_active ? alt_oscillator : na, color=alt_market_cap_color, title='Altcoin Marketcap Oscillator', linewidth=2)
plot(marketcap_oscillator_active ? custom_oscillator : na, color=grad, title='Custom Marketcap Oscillator', linewidth=3)
plot(marketcap_oscillator_active ? 0 : na, color=custom_oscillator > 0 ? color.red : color.lime, style=plot.style_circles, title='Baseline', linewidth=1)

// Add lines
plot(marketcap_oscillator_active ? marketcap_oscillator_high : na, title='High', color=color_high_low, linewidth=1)
hline(marketcap_oscillator_active ? marketcap_oscillator_medium : na, title='Medium', color=color_middle, linewidth=1)
plot(marketcap_oscillator_active ? marketcap_oscillator_low : na, title = 'Low', color=color_high_low, linewidth=1)
