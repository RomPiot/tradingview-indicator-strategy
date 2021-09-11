//@version=2

strategy("Strategie Heikin Ashi", shorttitle="HA Strategie", overlay=true)

fromDay = input(title="Date de début de test", defval=1)
fromMonth = input(title="Mois de début de test", defval=1)
fromYear = input(title="Année de début de test", defval=2021)
toDay = input(title="Jour de fin de test", defval=31)
toMonth = input(title="Mois de fin de test", defval=12)
toYear = input(title="Année de fin de test", defval=2021)

startDate = timestamp(fromYear, fromMonth, fromDay, 00, 00)
endDate = timestamp(toYear, toMonth, toDay, 00, 00)
time_cond = time >= startDate and time <= endDate
 
res = input(title="Durée des bougies Heikin Ashi", type=resolution, defval="1")
hshift = input(1,title="Heikin Ashi Candle Time Frame Shift")
res1 = input(title="Heikin Ashi EMA Time Frame", type=resolution, defval="240")
mhshift = input(0,title="Heikin Ashi EMA Time Frame Shift")
fama = input(1,"Heikin Ashi EMA Period")
test = input(1,"Heikin Ashi EMA Shift")
sloma = input(21,"Slow EMA Period")
slomas = input(1,"Slow EMA Shift")
logtransform = input(false, "Log Transform")
stoploss = input(true, "Mettre des Stop Loss")
showplots = input(true, "Afficher les lignes")

ha_t = heikinashi(tickerid)
ha_close = security(ha_t, res, logtransform ? log(close[hshift]) : close[hshift])
mha_close = security(ha_t, res1, logtransform ? log(close[mhshift]) : close[mhshift])

fma = ema(mha_close[test], fama)
sma = ema(ha_close[slomas], sloma)

plot(showplots ? (logtransform ? exp(fma) : fma) : na, title="MA", color=#0094ff, linewidth=2, style=line)
plot(showplots ? (logtransform ? exp(sma) : sma) : na, title="SMA", color=#ff6a00, linewidth=2, style=line)

golong = crossover(fma, sma)
goshort = crossunder(fma, sma)

if (time_cond)
    strategy.entry("Buy", strategy.long, when=golong, stop=(stoploss ? high+syminfo.mintick : na))
    strategy.entry("Sell", strategy.short, when=goshort, stop=(stoploss ? low-syminfo.mintick : na))

