//@version=4

strategy("Strategie Heikin Ashi", shorttitle="HA Strategie", overlay=true, initial_capital=1000, format=format.price, currency=currency.USD, default_qty_type=strategy.percent_of_equity, default_qty_value=100)

fromDay = input(title="Jour", defval=1, group="Date de début", inline="date_start")
fromMonth = input(title="Mois", defval=1, group="Date de début", inline="date_start")
fromYear = input(title="Année", defval=2021, group="Date de début", inline="date_start")
toDay = input(title="Jour", defval=31, group="Date de fin", inline="date_end")
toMonth = input(title="Mois", defval=12, group="Date de fin", inline="date_end")
toYear = input(title="Année", defval=2021, group="Date de fin", inline="date_end")

stopLossPercent = input(title="Stop Loss (%)", type=input.integer, minval=0, step=1, defval=5, group="SL & TP", inline="sl_tp") / 100
takeProfitPercent = input(title="Take Profit (%)", type=input.integer, minval=0, step=1, defval=25, group="SL & TP", inline="sl_tp") / 100

res = input(title="Durée des bougies", type=input.resolution, defval="15")
res1 = input(title="Période de temps de l'EMA Heikin Ashi", type=input.resolution, defval="240")
slowEmaTimeframe = input(20,"Période de l'EMA lente")
logTransform = input(true, "Log Transform")
showPlots = input(true, "Afficher les lignes")

startDate = timestamp(fromYear, fromMonth, fromDay, 00, 00)
endDate = timestamp(toYear, toMonth, toDay, 00, 00)
isInDate = time >= startDate and time <= endDate

longStopPrice = 0
shortStopPrice = 0

heikinAshi_Ticker = heikinashi(syminfo.tickerid)
heikinAshi_close = security(heikinAshi_Ticker, res, logTransform ? log(close[0]) : close[0], barmerge.gaps_off, barmerge.lookahead_on)
m_heikinAshi_close = security(heikinAshi_Ticker, res1, logTransform ? log(close[0]) : close[0], barmerge.gaps_off, barmerge.lookahead_on)

fma = ema(m_heikinAshi_close[0], 1) // green
sma = ema(heikinAshi_close[1], slowEmaTimeframe) // red

plot(showPlots ? (logTransform ? exp(fma) : fma) : na, title="MA", color=#43CA02, linewidth=2, style=plot.style_line)
plot(showPlots ? (logTransform ? exp(sma) : sma) : na, title="SMA", color=#FF110B, linewidth=2, style=plot.style_line)

golong = crossover(fma, sma)
goshort = crossunder(fma, sma)

// Determine where you've entered and in what direction
longStop = strategy.position_avg_price * (1 - stopLossPercent)
shortStop = strategy.position_avg_price * (1 + stopLossPercent)
shortTake = strategy.position_avg_price * (1 - takeProfitPercent)
longTake = strategy.position_avg_price * (1 + takeProfitPercent)

// If in range time selected by user
if (isInDate)
    
    // Take Profit and Stop Loss
    strategy.entry("LONG", strategy.long, when=golong)
    strategy.entry("SHORT", strategy.short, when=goshort)

    // Take Profit and Stop Loss orders
    if strategy.position_size > 0  
        strategy.exit(id = "Close Long", stop=longStop, limit=longTake)
       
    if strategy.position_size < 0 
        strategy.exit(id="Close Short", stop=shortStop, limit=shortTake)
    
// Take Profit and Stop Loss bar
plot(strategy.position_size > 0 ? longStop : na, style=plot.style_linebr, color=#FF0404, linewidth=2, title="Long Stop Loss")
plot(strategy.position_size > 0 ? longTake : na, style=plot.style_linebr, color=#37FF37, linewidth=2, title="Long Take Profit")
plot(strategy.position_size < 0 ? shortStop : na, style=plot.style_linebr, color=#FF0404, linewidth=2, title="Short Stop Loss")
plot(strategy.position_size < 0 ? shortTake : na, style=plot.style_linebr, color=#37FF37, linewidth=2, title="Short Take Profit")
