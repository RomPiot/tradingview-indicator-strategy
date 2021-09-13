//@version=2

strategy("Strategie Heikin Ashi", shorttitle="HA Strategie", overlay=true)

fromDay = input(title="Date de début de test", defval=1)
fromMonth = input(title="Mois de début de test", defval=1)
fromYear = input(title="Année de début de test", defval=2021)
toDay = input(title="Jour de fin de test", defval=31)
toMonth = input(title="Mois de fin de test", defval=12)
toYear = input(title="Année de fin de test", defval=2021)
stopLossPercent = input(title="Stop Loss (%)", type=float, minval=0.0, step=0.1, defval=3) / 100
takeProfitPercent = input(title="Take Profit (%)", type=float, minval=0.0, step=0.1, defval=25) / 100
// leverageEffect = input(title="Effet de levier", minval=0, step=1, defval=0)
res = input(title="Durée des bougies Heikin Ashi", type=resolution, defval="15")
res1 = input(title="Heikin Ashi EMA Time Frame", type=resolution, defval="240")
// fama = input(1,"Heikin Ashi EMA Period")
sloma = input(21,"Slow EMA Period")
// slomas = input(1,"Slow EMA Shift")
logtransform = input(true, "Log Transform")
showplots = input(true, "Afficher les lignes")

startDate = timestamp(fromYear, fromMonth, fromDay, 00, 00)
endDate = timestamp(toYear, toMonth, toDay, 00, 00)
time_condition = time >= startDate and time <= endDate

fama = 1
slomas = 1
hshift = 0
mhshift = 0
test = 0
longStopPrice = 0
shortStopPrice = 0

ha_t = heikinashi(tickerid)
ha_close = security(ha_t, res, logtransform ? log(close[hshift]) : close[hshift])
mha_close = security(ha_t, res1, logtransform ? log(close[mhshift]) : close[mhshift])

fma = ema(mha_close[test], fama)
sma = ema(ha_close[slomas], sloma)

plot(showplots ? (logtransform ? exp(fma) : fma) : na, title="MA", color=#0094ff, linewidth=2, style=line)
plot(showplots ? (logtransform ? exp(sma) : sma) : na, title="SMA", color=#ff6a00, linewidth=2, style=line)

golong = crossover(fma, sma)
goshort = crossunder(fma, sma)

// Determine where you've entered and in what direction
longStop = strategy.position_avg_price * (1 - stopLossPercent)
shortStop = strategy.position_avg_price * (1 + stopLossPercent)
shortTake = strategy.position_avg_price * (1 - takeProfitPercent)
longTake = strategy.position_avg_price * (1 + takeProfitPercent)

// If in range time selected by user
if (time_condition)
    
    // Take Profit and Stop Loss
    strategy.entry("LONG", strategy.long, when=golong)
    strategy.entry("SHORT", strategy.short, when=goshort)

    // Take Profit and Stop Loss orders
    if strategy.position_size > 0 
        strategy.exit(id = "Close Long", stop = longStop, limit = longTake)
       
    if strategy.position_size < 0 
        strategy.exit(id="Close Short", stop=shortStop, limit=shortTake)
    
// Take Profit and Stop Loss graph
plot(strategy.position_size > 0 ? longStop : na, style=linebr, color=#FF0404, linewidth=2, title="Long Stop Loss")
plot(strategy.position_size > 0 ? longTake : na, style=linebr, color=#37FF37, linewidth=2, title="Long Take Profit")
plot(strategy.position_size < 0 ? shortStop : na, style=linebr, color=#FF0404, linewidth=2, title="Short Stop Loss")
plot(strategy.position_size < 0 ? shortTake : na, style=linebr, color=#37FF37, linewidth=2, title="Short Take Profit")
