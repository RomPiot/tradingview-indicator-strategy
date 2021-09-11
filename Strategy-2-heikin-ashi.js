//@version=2

strategy("Heikin Ashi Strategy", shorttitle="HA Strategy", overlay=true)

fromDay = input(title="From day", defval=1)
fromMonth = input(title="From month", defval=1)
fromYear = input(title="From year", defval=2021)
toDay = input(title="To day", defval=31)
toMonth = input(title="To month", defval=12)
toYear = input(title="To year", defval=2021)

startDate = timestamp(fromYear, fromMonth, fromDay, 00, 00)
endDate = timestamp(toYear, toMonth, toDay, 00, 00)
time_cond = time >= startDate and time <= endDate
 
res = input(title="Heikin Ashi Candle Time Frame", type=resolution, defval="5")
hshift = input(1,title="Heikin Ashi Candle Time Frame Shift")
res1 = input(title="Heikin Ashi EMA Time Frame", type=resolution, defval="240")
mhshift = input(0,title="Heikin Ashi EMA Time Frame Shift")
fama = input(1,"Heikin Ashi EMA Period")
test = input(1,"Heikin Ashi EMA Shift")
sloma = input(30,"Slow EMA Period")
slomas = input(1,"Slow EMA Shift")
logtransform = input(false, "Log Transform")
stoploss = input(true, "Stop Loss")
showplots = input(true, "Show Plots")

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

