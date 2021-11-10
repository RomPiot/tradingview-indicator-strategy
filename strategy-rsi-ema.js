// reprendre le ha strat 2
// si rsi (bas ou haut) réintegre (30 ou 70), prendre position à l'ouverture
    // cloturer position lorsqu'une meche touche le ema ha

//@version=4

strategy("Strategie RSI & EMA HA", shorttitle="RSI EMA HA", overlay=true, initial_capital=1000, format=format.price, currency=currency.USD, default_qty_type=strategy.percent_of_equity, default_qty_value=100)

// Dates 
startDate = input(defval=timestamp("01 Sep 2021 00:00 +0000"), title="Start Time", type=input.time, group="Dates")
endDate = input(defval=timestamp("01 Jan 2022 00:00 +0000"), title="End Time", type=input.time)
isInDateRange = time >= startDate and time <= endDate

stopLossPercent = input(title="Stop Loss (%)", type=input.integer, minval=0, step=1, defval=5, group="SL & TP", inline="sl_tp") / 100
takeProfitPercent = input(title="Take Profit (%)", type=input.integer, minval=0, step=1, defval=25, group="SL & TP", inline="sl_tp") / 100

slowEmaTimeframe = input(20,"Période de l'EMA lente")
logTransform = input(true, "Log Transform")   
showPlots = input(true, "Afficher les lignes")

length = input( 14 )
overSold = input( 30 )
overBought = input( 70 )
price = close
vrsi = rsi(price, length)

longStopPrice = 0
shortStopPrice = 0
 
heikinAshi_Ticker = heikinashi(syminfo.tickerid)   
heikinAshi_close = security(heikinAshi_Ticker, timeframe.period, logTransform ? log(close[0]) : close[0], barmerge.gaps_off, barmerge.lookahead_on)

redEma = ema(heikinAshi_close[0], slowEmaTimeframe) // red 
// redEma = open
ema = logTransform ? exp(redEma) : redEma
plot(showPlots ? ema : na, title="redEma", color=#FBC02D, linewidth=2, style=plot.style_line)

// rsi cross ema
golong = crossover(vrsi, overSold)
goshort = crossunder(vrsi, overBought)
closePosition = cross(close, ema)
 
// Determine where you've entered and in what direction
longStop = strategy.position_avg_price * (1 - stopLossPercent)
shortStop = strategy.position_avg_price * (1 + stopLossPercent)
shortTake = strategy.position_avg_price * (1 - takeProfitPercent)
longTake = strategy.position_avg_price * (1 + takeProfitPercent)

f_round(nb) => round(nb * 100) / 100

// If in range time selected by user
if (isInDateRange)
    
    // Take Profit and Stop Loss
    strategy.entry("LONG - " + tostring(f_round(open)), strategy.long, when=golong)
    strategy.entry("SHORT - " + tostring(f_round(open)), strategy.short, when=goshort)

    // Take Profit and Stop Loss orders
    if strategy.position_size > 0
        strategy.exit(id = "Close Long - " + tostring(f_round(open)), stop=longStop, limit=longTake)
       
    if strategy.position_size < 0
        strategy.exit(id="Close Short - " + tostring(f_round(open)), stop=shortStop, limit=shortTake)
    

    strategy.close_all(when = closePosition, comment="Close Position - " + tostring(close))

        
// Take Profit and Stop Loss bar
plot(strategy.position_size > 0 ? longStop : na, style=plot.style_linebr, color=#FF0404, linewidth=2, title="Long Stop Loss")
plot(strategy.position_size > 0 ? longTake : na, style=plot.style_linebr, color=#37FF37, linewidth=2, title="Long Take Profit")
plot(strategy.position_size < 0 ? shortStop : na, style=plot.style_linebr, color=#FF0404, linewidth=2, title="Short Stop Loss")
plot(strategy.position_size < 0 ? shortTake : na, style=plot.style_linebr, color=#37FF37, linewidth=2, title="Short Take Profit")
