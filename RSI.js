//@version=4
study(title="RSI", shorttitle="RSI", format=format.price, precision=2, resolution="")

///////////////////////////////////////////////////////////////////////////////////////////////////
//// RSI (RSI)
///////////////////////////////////////////////////////////////////////////////////////////////////

stoch_periodK = input(14, title="%K Length", minval=1)
stoch_smoothK = input(1, title="%K Smoothing", minval=1)
stoch_periodD = input(3, title="%D Smoothing", minval=1)
stoch_k = sma(stoch(close, high, low, stoch_periodK), stoch_smoothK)
stoch_d = sma(stoch_k, stoch_periodD)
plot(stoch_k, title="%K", color=#2962FF)
plot(stoch_d, title="%D", color=#FF6D00)
stoch_h0 = hline(80, "Upper Band", color=#787B86)
stoch_h1 = hline(20, "Lower Band", color=#787B86)
fill(stoch_h0, stoch_h1, color=color.rgb(33, 150, 243, 90), title="Background")


rsi_len = input(14, minval=1, title="Longueur")
rsi_src = close
rsi_up = rma(max(change(rsi_src), 0), rsi_len)
rsi_down = rma(-min(change(rsi_src), 0), rsi_len)
rsi_rsi = rsi_down == 0 ? 100 : rsi_up == 0 ? 0 : 100 - (100 / (1 + rsi_up / rsi_down))
plot(rsi_rsi, "Ligne RSI", color=color.yellow)
rsi_band1 = plot(70, "Bande supérieur", color=#9C27B0)
rsi_bandm = hline(50, "Bande centrale", color=color.new(#BA68C8, 50))
rsi_band0 = plot(30, "bande inférieur", color=#9C27B0)
fill(rsi_band1, rsi_band0, color=color.rgb(126, 87, 194, 90), title="Background")