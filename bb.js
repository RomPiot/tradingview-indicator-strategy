//@version=4
strategy(title="Bollinger Band Breakout", shorttitle = "BB Strategy",overlay=true, initial_capital=1000, format=format.price, currency=currency.USD, default_qty_type=strategy.percent_of_equity, default_qty_value=100)

// TODO : décalage offset de -3 et pouvoir l'utiliser dans le script, pas juste sur les plot
// TODO : si touche sma, close position

// Inputs 
sma = input(20,  minval=1)
mult   = input(2, minval=0.001, maxval=50)
src = input(open)
offset = input(0, "Offset", type = input.integer, minval = -500, maxval = 500)

// Calculations 
basis = sma(src, sma)
dev   = mult * stdev(src, sma)
upper = basis + dev
lower = basis - dev

leverage = input(1, "Leverage")

// Dates 
startDate = input(defval=timestamp("01 Sep 2021 00:00 +0000"), title="Start Time", type=input.time, group="Dates")
endDate = input(defval=timestamp("01 Jan 2022 00:00 +0000"), title="End Time", type=input.time)
isInDateRange = time >= startDate and time <= endDate

// PLOT //
lu = plot(upper, color = color.green, linewidth = 2, offset = offset)
ll = plot(lower, color = color.red,   linewidth = 2, offset = offset)
plot(basis, "Basis", color=#FF6D00, offset = offset)

// fill(lu, ll, color = color.gray)

// Signals //

short  = crossover(src, upper)
long = crossunder(src, lower)

// Strategy entry //
if (isInDateRange)
    strategy.entry("LONG - " + tostring(src),  strategy.long, when = long)
    strategy.entry("SHORT - " + tostring(src),  strategy.short, when = short)
    
    if strategy.position_size > 0  
        strategy.close_all(when = src > basis, comment="Close Long - " + tostring(src))

    if strategy.position_size < 0
        strategy.close_all(when = src < basis, comment = "Close Short - " + tostring(src), alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")

    // strategy exit //
    
    // strategy.exit("long tsl", "long", loss = close*0.075 / syminfo.mintick, trail_points = close*0.05 / syminfo.mintick, trail_offset = close*0.005 / syminfo.mintick)
    // strategy.exit("short tsl", "short", loss = close*0.075 / syminfo.mintick, trail_points = close*0.05 / syminfo.mintick, trail_offset = close*0.005 / syminfo.mintick)



