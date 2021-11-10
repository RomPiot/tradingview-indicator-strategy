//@version=4
strategy(title="Henkin Ashi NB Bar", shorttitle="HA nb Bar", overlay=true, initial_capital=1000, format=format.price, currency=currency.USD, default_qty_type=strategy.percent_of_equity, default_qty_value=100, calc_on_every_tick=false)

// Dates 
startDate = input(defval=timestamp("01 Sep 2021 00:00 +0000"), title="Start Time", type=input.time, group="Dates")
endDate = input(defval=timestamp("01 Jan 2022 00:00 +0000"), title="End Time", type=input.time)
time_condition = time >= startDate and time <= endDate

stopLossPercent = input(title="Stop Loss (%)", type=input.integer, minval=0, step=1, defval=5, group="SL & TP", inline="sl_tp") / 100
takeProfitPercent = input(title="Take Profit (%)", type=input.integer, minval=0, step=1, defval=25, group="SL & TP", inline="sl_tp") / 100
minimumProfit = input(title="Minimum profit (%)", type=input.integer, minval=0, step=1, defval=5, group="SL & TP", inline="sl_tp") / 100

data = heikinashi(syminfo.tickerid)
o = security(data, timeframe.period, open)
h = security(data, timeframe.period, high)
l = security(data, timeframe.period, low)
c = security(data, timeframe.period, close)

// signal to long or short
longSignal = c > o
shortSignal = c < o

// Determine where you've entered and in what direction
longStop = strategy.position_avg_price * (1 - stopLossPercent)
shortStop = strategy.position_avg_price * (1 + stopLossPercent)
shortTake = strategy.position_avg_price * (1 - takeProfitPercent)
longTake = strategy.position_avg_price * (1 + takeProfitPercent)

f_round(nb) => round(nb * 100) / 100

if (time_condition)
    // Take Profit and Stop Loss
    strategy.entry("LONG - " + tostring(f_round(open)), strategy.long, when=longSignal, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
    strategy.entry("SHORT - " + tostring(f_round(open)), strategy.short, when=shortSignal, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
     
    // Take Profit and Stop Loss orders
    if strategy.position_size > 0  
        strategy.exit(id = "Close Long - " + tostring(f_round(open)), stop=longStop, limit=longTake, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")

    if strategy.position_size < 0
        strategy.exit(id="Close Short - " + tostring(f_round(open)), stop=shortStop, limit=shortTake, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
