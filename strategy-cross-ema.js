//@version=4
strategy(title="MA Cross", shorttitle="MA Cross", overlay=true, initial_capital=1000, format=format.price, currency=currency.USD, default_qty_type=strategy.percent_of_equity, default_qty_value=100, calc_on_every_tick=false)

// Dates 
startDate = input(defval=timestamp("01 Sep 2021 00:00 +0000"), title="Start Time", type=input.time, group="Dates")
endDate = input(defval=timestamp("01 Jan 2022 00:00 +0000"), title="End Time", type=input.time)
time_condition = time >= startDate and time <= endDate

// EMA length
shortlen = input(21, "Short MA Length", minval=1)
longlen = input(147, "Long MA Length", minval=1)

stopLossPercent = input(title="Stop Loss (%)", type=input.integer, minval=0, step=1, defval=5, group="SL & TP", inline="sl_tp") / 100
takeProfitPercent = input(title="Take Profit (%)", type=input.integer, minval=0, step=1, defval=25, group="SL & TP", inline="sl_tp") / 100

data = heikinashi(syminfo.tickerid)
o = security(data, timeframe.period, open)
h = security(data, timeframe.period, high)
l = security(data, timeframe.period, low)
c = security(data, timeframe.period, close)

fast_ma = sma(o, shortlen)
slow_ma = sma(o, longlen)

plot(slow_ma, color = #FBFB04, linewidth=2)
plot(fast_ma, color = #5BFC0E, linewidth=2)
plot(cross(slow_ma, fast_ma) ? slow_ma : na, color =color.white, style = plot.style_cross, linewidth = 4)

// signal to long or short
longSignal = crossover(fast_ma, slow_ma)
shortSignal = crossunder(fast_ma, slow_ma)

// Determine where you've entered and in what direction
longStop = strategy.position_avg_price * (1 - stopLossPercent)
shortStop = strategy.position_avg_price * (1 + stopLossPercent)
shortTake = strategy.position_avg_price * (1 - takeProfitPercent)
longTake = strategy.position_avg_price * (1 + takeProfitPercent)

f_round(nb) => round(nb * 100) / 100

if (time_condition)
    // Take Profit and Stop Loss
    strategy.entry("LONG - " + tostring(f_round(o)), strategy.long, when=longSignal, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
    strategy.entry("SHORT - " + tostring(f_round(o)), strategy.short, when=shortSignal, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
     
    // Take Profit and Stop Loss orders
    if strategy.position_size > 0  
        strategy.exit(id = "Close Long - " + tostring(f_round(o)), stop=longStop, limit=longTake, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")

    if strategy.position_size < 0
        strategy.exit(id="Close Short - " + tostring(f_round(o)), stop=shortStop, limit=shortTake, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")

// Take Profit and Stop Loss bar
plot(strategy.position_size > 0 ? longStop : na, style=plot.style_linebr, color=#FF0404, linewidth=2, title="Long Stop Loss")
plot(strategy.position_size > 0 ? longTake : na, style=plot.style_linebr, color=#37FF37, linewidth=2, title="Long Take Profit")
plot(strategy.position_size < 0 ? shortStop : na, style=plot.style_linebr, color=#FF0404, linewidth=2, title="Short Stop Loss")
plot(strategy.position_size < 0 ? shortTake : na, style=plot.style_linebr, color=#37FF37, linewidth=2, title="Short Take Profit")
