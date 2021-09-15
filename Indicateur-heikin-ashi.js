//@version=4

study("Strategie Heikin Ashi", shorttitle="HA Strategie", overlay=true)

fromDay = input(title="Date de début de test", defval=1)
fromMonth = input(title="Mois de début de test", defval=1)
fromYear = input(title="Année de début de test", defval=2021)
toDay = input(title="Jour de fin de test", defval=31)
toMonth = input(title="Mois de fin de test", defval=12)
toYear = input(title="Année de fin de test", defval=2021)
stopLossPercent = input(title="Stop Loss (%)", type=input.float, minval=0.0, step=0.1, defval=5.0) / 100
takeProfitPercent = input(title="Take Profit (%)", type=input.float, minval=0.0, step=0.1, defval=25) / 100
// leverageEffect = input(title="Effet de levier", minval=0, step=1, defval=0)
candleTimeframe = input(title="Période de temps de l'Heikin Ashi", type=input.resolution, defval="1")
emaTimeframe = input(title="Période de temps de l'EMA Heikin Ashi EMA", type=input.resolution, defval="240")
slowEmaTimeframe = input(21,"Période de temps de l'EMA lente")
logTransform = input(true, "Log Transform")
showPlots = input(true, "Afficher les lignes")

startDate = timestamp(fromYear, fromMonth, fromDay, 00, 00)
endDate = timestamp(toYear, toMonth, toDay, 00, 00)
time_condition = time >= startDate and time <= endDate

heikinashi_ticker = heikinashi(syminfo.tickerid)
ha_close = security(heikinashi_ticker, candleTimeframe, logTransform ? log(close[0]) : close[0], barmerge.gaps_off, barmerge.lookahead_on)
mha_close = security(heikinashi_ticker, emaTimeframe, logTransform ? log(close[0]) : close[0], barmerge.gaps_off, barmerge.lookahead_on)

ema_ha = ema(mha_close[0], 1) // blue bar
slow_ema = ema(ha_close[1], slowEmaTimeframe) // orange bar

plot(showPlots ? (logTransform ? exp(ema_ha) : ema_ha) : na, title="MA", color=#0094ff, linewidth=2, style= plot.style_line)
plot(showPlots ? (logTransform ? exp(slow_ema) : slow_ema) : na, title="SMA", color=#ff6a00, linewidth=2, style= plot.style_line)

golong = crossover(ema_ha, slow_ema)
goshort = crossunder(ema_ha, slow_ema)

// Plot signals on MA cross
plotshape(golong, style=shape.labelup, location=location.belowbar, color=color.green, size=size.tiny, title="Long Entry", text="LONG", textcolor=color.white)
plotshape(goshort, style=shape.labeldown, location=location.abovebar, color=color.red, size=size.tiny, title="Short Entry", text="SHORT", textcolor=color.white)

// Detect what was last signal (long or short)
long_short = 0
long_last = golong and (nz(long_short[1]) == 0 or nz(long_short[1]) == -1)
short_last = goshort and (nz(long_short[1]) == 0 or nz(long_short[1]) == 1)
long_short := long_last ? 1 : short_last ? -1 : long_short[1]

// Entry price
longPrice = valuewhen(long_last, close, 0)
shortPrice = valuewhen(short_last, close, 0)

// Determine where you've entered and in what direction
longStop = longPrice * (1 - stopLossPercent)
shortStop = shortPrice * (1 + stopLossPercent)
longTake = longPrice * (1 + takeProfitPercent)
shortTake = shortPrice * (1 - takeProfitPercent)

// Plot sltp lines
plot(long_short==1  ? longStop : na, style=plot.style_linebr, color=color.red, linewidth=1, title="Long Fixed SL")
plot(long_short==-1 ? shortStop : na, style=plot.style_linebr, color=color.red, linewidth=1, title="Short Fixed SL")
plot(long_short==1  ? longTake : na, style=plot.style_linebr, color=color.green, linewidth=1, title="Long Fixed TP")
plot(long_short==-1 ? shortTake : na, style=plot.style_linebr, color=color.green, linewidth=1, title="Short Fixed TP")

longBar1 = barssince(long_last)
longBar2 = longBar1 >= 1 ? true : false
shortBar1 = barssince(short_last)
shortBar2 = shortBar1 >= 1 ? true : false

// Check for SL hit during a bar
longSLhit = long_short==1 and longBar2 and low < longStop
plotshape(longSLhit, style=shape.labelup, location=location.belowbar, color=color.gray, size=size.tiny, title="Long SL", text=" Long SL", textcolor=color.white)
shortSLhit = long_short==-1 and shortBar2 and high > shortStop
plotshape(shortSLhit, style=shape.labeldown, location=location.abovebar, color=color.gray, size=size.tiny, title="Short SL", text=" Short SL", textcolor=color.white)

// Check for TP hit during bar
longTPhit = long_short==1 and longBar2 and high > longTake
plotshape(longTPhit, style=shape.labeldown, location=location.abovebar, color=color.purple, size=size.tiny, title="Long TP", text="Long TP", textcolor=color.white)
shortTPhit = long_short==-1 and shortBar2 and low < shortTake
plotshape(shortTPhit, style=shape.labelup, location=location.belowbar, color=color.purple, size=size.tiny, title="Short TP", text="Short TP", textcolor=color.white)

// Reset long_short if SL/TP hit during bar
long_short := (long_short==1 or long_short==0) and longBar2 and (longSLhit or longTPhit) ? 0 : (long_short==-1 or long_short==0) and shortBar2 and (shortSLhit or shortTPhit) ? 0 : long_short

// Set Alerts for Open Long/Short, SL Hit, TP Hit
alertcondition(condition=long_last, title="Long Alarm", message='Open a Long Trade @ ${{close}}')
alertcondition(condition=short_last, title="Short Alarm", message='Open a Short Trade @ ${{close}}')

alertcondition(condition=longSLhit, title="Long Stop", message='Long SL Hit @ ${{plot("Long SL")}}')
alertcondition(condition=shortSLhit, title="Short Stop", message='Short SL Hit @ ${{plot("Short SL")}}')

alertcondition(condition=longTPhit, title="Long Take Profit", message='Long TP Hit @ ${{plot("Long TP")}}')
alertcondition(condition=shortTPhit, title="Short Take Profit", message='Short TP Hit @ ${{plot("Short TP")}}')
