//@version=5
indicator(title="RSI", shorttitle="RSI", format=format.price, precision=2)

soc_active  = input.bool(true, title="Activer le Sochastique")
rsi_active  = input.bool(true, title="Activer le RSI")
flow_active  = input.bool(true, title="Activer le Volume Flow")
marketcap_rsi_active  = input.bool(true, title="Activer le Marketcap RSI")
marketcap_oscillator_active  = input.bool(true, title="Activer le Marketcap Oscillator")

color_high_low  = input(#9C27B0, "Couleur des bandes hautes et basse")
color_middle  = input(#BA68C8, "Couleur centrale")

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
//// RSI
///////////////////////////////////////////////////////////////////////////////////////////////////

rsi_len = input.int(14, minval = 1, title = "Period", inline="rsi", group = 'RSI')
rsi_color  = input(color.yellow, "", inline="rsi", group="RSI")
rsi_up = ta.rma(math.max(ta.change(close), 0), rsi_len)
rsi_down = ta.rma(-math.min(ta.change(close), 0), rsi_len)
rsi_rsi = rsi_down == 0 ? 100 : rsi_up == 0 ? 0 : 100 - (100 / (1 + rsi_up / rsi_down))
plot(rsi_active ? rsi_rsi : na, "Ligne RSI", color=rsi_color, linewidth=2)
rsi_band1 = plot(rsi_active ? 70 : na, "High", color=color_high_low, linewidth=1)
rsi_bandm = hline(rsi_active ? 50 : na, "Medium", color=color_middle, linewidth=1)
rsi_band0 = plot(rsi_active ? 30 : na, "Low", color=color_high_low, linewidth=1)
// fill(rsi_band1, rsi_band0, color = color.rgb(126, 87, 194, 90), title = "Background")

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
//// Marketcap
///////////////////////////////////////////////////////////////////////////////////////////////////

// inputs
marketcap_length = input.int(21, 'Length', group = 'Market Cap')

leader_market_cap = input.symbol(title='BTC Market Cap', inline="leader_market_cap", defval='CRYPTOCAP:BTC', group='Market Cap')
leader_market_cap_color  = input(color.orange, "", inline="leader_market_cap", group="Market Cap")
alt_market_cap = input.symbol(title='Altcoin Market Cap', inline="alt_market_cap", defval='CRYPTOCAP:TOTAL3', group='Market Cap')
alt_market_cap_color  = input(color.blue, "", inline="alt_market_cap", group="Market Cap")
custom_market_cap = input.symbol(title='Custom Market Cap', inline="custom_market_cap_color", defval='CRYPTOCAP:DOT', group='Market Cap')
custom_market_cap_color  = input(color.yellow, "", inline="custom_market_cap_color", group="Market Cap")

// Get BTC & alt market caps
leader_cap = request.security(leader_market_cap, timeframe=timeframe.period, expression=close)
alt_cap = request.security(alt_market_cap, timeframe=timeframe.period, expression=close)
custom_cap = request.security(custom_market_cap, timeframe=timeframe.period, expression=close)

// hlines
plot(marketcap_rsi_active ? 70 : na, 'High', color=color_high_low, linewidth=1)
hline(marketcap_rsi_active ? 50 : na, 'Medium', color=color_middle, linewidth=1)
plot(marketcap_rsi_active ? 30 : na, 'Low', color=color_high_low, linewidth=1)

// RSI
rsi_leader = ta.rsi(leader_cap, marketcap_length)
rsi_alt = ta.rsi(alt_cap, marketcap_length)
rsi_custom = ta.rsi(custom_cap, marketcap_length)

// Plot
plot(marketcap_rsi_active ? rsi_leader : na, 'BTC Marketcap RSI', color=leader_market_cap_color, linewidth=2)
plot(marketcap_rsi_active ? rsi_alt : na, 'Altcoin  Marketcap RSI', color=alt_market_cap_color, linewidth=2)
plot(marketcap_rsi_active ? rsi_custom : na, 'Custom Marketcap RSI', color=custom_market_cap_color, linewidth=3)

///////////////////////////////////////////////////////////////////////////////////////////////////
//// Marketcap Oscillator
///////////////////////////////////////////////////////////////////////////////////////////////////

market_cap_oscillator  = input.int(100, "Oscillator", group="Market Cap")

// base 100
leader_oscillator = market_cap_oscillator - leader_cap[marketcap_length] / leader_cap * 100
alt_oscillator = market_cap_oscillator - alt_cap[marketcap_length] / alt_cap * 100
custom_oscillator = market_cap_oscillator - custom_cap[marketcap_length] / custom_cap * 100

marketcap_oscillator_high = 20
marketcap_oscillator_medium = 0
marketcap_oscillator_low = -20

// plot BTC and Alt market cap 100 base
grad = color.from_gradient(marketcap_oscillator_active ? custom_oscillator : na, marketcap_oscillator_low, marketcap_oscillator_high, color.lime, color.red)
plot(marketcap_oscillator_active ? leader_oscillator : na, color=leader_market_cap_color, title='BTC Marketcap Oscillator', linewidth=2)
plot(marketcap_oscillator_active ? alt_oscillator : na, color=alt_market_cap_color, title='Altcoin Marketcap Oscillator', linewidth=2)
plot(marketcap_oscillator_active ? custom_oscillator : na, color=grad, title='Custom Marketcap Oscillator', linewidth=3)
plot(marketcap_oscillator_active ? 0 : na, color=custom_oscillator > 0 ? color.red : color.lime, style=plot.style_circles, title='Baseline', linewidth=1)

// Add lines
plot(marketcap_oscillator_active ? marketcap_oscillator_high : na, title='High', color=color_high_low, linewidth=1)
hline(marketcap_oscillator_active ? marketcap_oscillator_medium : na, title='Medium', color=color_middle, linewidth=1)
plot(marketcap_oscillator_active ? marketcap_oscillator_low : na, title = 'Low', color=color_high_low, linewidth=1)
