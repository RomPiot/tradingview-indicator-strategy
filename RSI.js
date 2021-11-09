//@version=4
study(title="RSI", shorttitle="RSI", format=format.price, precision=2, resolution="")

soc_active  = input(true, title="Activer le Sochastique")
rsi_active  = input(true, title="Activer le RSI")
flow_active  = input(true, title="Activer le Volume Flow")

///////////////////////////////////////////////////////////////////////////////////////////////////
//// Stochastic
///////////////////////////////////////////////////////////////////////////////////////////////////

stoch_periodK = input(14, title="%K Length", minval=1)
stoch_smoothK = input(1, title="%K Smoothing", minval=1)
stoch_periodD = input(3, title="%D Smoothing", minval=1)
stoch_k = sma(stoch(close, high, low, stoch_periodK), stoch_smoothK)
stoch_d = sma(stoch_k, stoch_periodD)
plot(soc_active ? stoch_k : na, title="%K", color=#2962FF)
plot(soc_active ? stoch_d : na, title="%D", color=#FF6D00)
stoch_h0 = hline(soc_active ? 80 : na, "Upper Band", color=#787B86)
stoch_h1 = hline(soc_active ? 20 : na, "Lower Band", color=#787B86)
fill(stoch_h0, stoch_h1, color=color.rgb(33, 150, 243, 90), title="Background")


///////////////////////////////////////////////////////////////////////////////////////////////////
//// RSI
///////////////////////////////////////////////////////////////////////////////////////////////////

rsi_len = input(14, minval=1, title="Longueur")
rsi_src = close
rsi_up = rma(max(change(rsi_src), 0), rsi_len)
rsi_down = rma(-min(change(rsi_src), 0), rsi_len)
rsi_rsi = rsi_down == 0 ? 100 : rsi_up == 0 ? 0 : 100 - (100 / (1 + rsi_up / rsi_down))
plot(rsi_active ? rsi_rsi : na, "Ligne RSI", color=color.yellow)
rsi_band1 = plot(rsi_active ? 70 : na, "Bande supérieur", color=#9C27B0)
rsi_bandm = hline(rsi_active ? 50 : na, "Bande centrale", color=color.new(#BA68C8, 50))
rsi_band0 = plot(rsi_active ? 30 : na, "bande inférieur", color=#9C27B0)
fill(rsi_band1, rsi_band0, color = color.rgb(126, 87, 194, 90), title = "Background")


///////////////////////////////////////////////////////////////////////////////////////////////////
//// Volume Flow
///////////////////////////////////////////////////////////////////////////////////////////////////

length = input(130, title="VFI length")
coef = input(0.2)
vcoef = input(2.5, title="Max. vol. cutoff")
signalLength=input(5)

ma(x,y) => x

typical=hlc3
inter = log( typical ) - log( typical[1] )
vinter = stdev(inter, 30 )
cutoff = coef * vinter * close
vave = sma( volume, length )[1]
vmax = vave * vcoef
vc = iff(volume < vmax, volume, vmax) //min( volume, vmax )
mf = typical - typical[1]
vcp = iff( mf > cutoff, vc, iff ( mf < -cutoff, -vc, 0 ) )

vfi = ma(sum( vcp , length )/vave, 3)
vfima=ema( vfi, signalLength )

plot(flow_active ? 0 : na, color=color.gray, style=3)
plot(flow_active ? vfima : na, title="EMA of vfi", color=color.orange)
plot(flow_active ? vfi: na, title="vfi", color=color.green,linewidth=2)
