//@version=4
strategy(title="Speed & Slow EMA", shorttitle="S&S EMA", overlay=true, initial_capital=1000, format=format.price, currency=currency.USD, default_qty_type=strategy.percent_of_equity, default_qty_value=100)

// Dates 
startDate = input(defval=timestamp("01 Sep 2021 00:00 +0000"), title="Start Time", type=input.time, group="Dates")
endDate = input(defval=timestamp("01 Jan 2022 00:00 +0000"), title="End Time", type=input.time)
time_condition = time >= startDate and time <= endDate

stopLossPercent = input(title="Stop Loss (%)", type=input.integer, minval=0, step=1, defval=5, group="SL & TP", inline="sl_tp") / 100
takeProfitPercent = input(title="Take Profit (%)", type=input.integer, minval=0, step=1, defval=25, group="SL & TP", inline="sl_tp") / 100
minimumProfit = input(title="Minimum profit (%)", type=input.integer, minval=0, step=1, defval=5, group="SL & TP", inline="sl_tp") / 100

// Getting inputs
fast_length = input(title="Fast Length", type=input.integer, defval=1, group="Configuration")
slow_length = input(title="Slow Length", type=input.integer, defval=20, group="Configuration")
// src = input(title="Source", type=input.source, defval=close, group="Configuration") 
macd_length = input(title="Taille du MACD", type=input.integer, minval = 1, maxval = 50, defval = 9, group="Configuration")
// sma_source = input(title="Oscillator MA Type", type=input.string, defval="EMA", options=["SMA", "EMA"], group="Configuration")
// sma_signal = input(title = "Signal Line MA Type", type = input.string, defval = "EMA", options = ["SMA", "EMA"], group="Configuration")
trendline_ema_length = input(title="Taille de tendance de l'EMA ", type=input.integer, minval=1, maxval=1000, defval=100, group="Configuration")

// fast_length = 1
src = close

sma_source = "EMA"
sma_signal = "EMA"

// Plot colors
col_macd = input(#5BFC0E, "MACD Line  ", input.color, group="Color Settings", inline="MACD")
col_signal = input(#FF110B, "Signal Line  ", input.color, group="Color Settings", inline="Signal")
col_grow_above = input(#26A69A, "Above   Grow", input.color, group="Histogram", inline="Above")
col_fall_above = input(#B2DFDB, "Fall", input.color, group="Histogram", inline="Above")
col_grow_below = input(#FFCDD2, "Below Grow", input.color, group="Histogram", inline="Below")
col_fall_below = input(#FF5252, "Fall", input.color, group="Histogram", inline="Below")
// col_trendline_ema = input(#FBFB04, "TrendLine EMA ", input.color, group="Color Settings")

// Calculating
fast_ma = sma_source == "SMA" ? sma(src, fast_length) : ema(src, fast_length)
slow_ma = sma_source == "SMA" ? sma(src, slow_length) : ema(src, slow_length)
macd = fast_ma - slow_ma
signal = sma_signal == "SMA" ? sma(macd, macd_length) : ema(macd, macd_length)
trendline_ema = sma_source == "SMA" ? sma(src, trendline_ema_length) : ema(src, trendline_ema_length)
hist = macd - signal
plot(hist, title="Histogram", style=plot.style_columns, color=(hist>=0 ? (hist[1] < hist ? col_grow_above : col_fall_above) : (hist[1] < hist ? col_grow_below : col_fall_below)))
plot(macd, title="MACD", color=col_macd, linewidth=2)
plot(signal, title="Signal", color=col_signal, linewidth=2)
// plot(trendline_ema, color=col_trendline_ema, style=plot.style_line, title="EMA Trendline", linewidth=2)

// 
longSignal = crossover(macd, signal)
shortSignal = crossunder(macd, signal)

// Determine where you've entered and in what direction
longStop = strategy.position_avg_price * (1 - stopLossPercent)
shortStop = strategy.position_avg_price * (1 + stopLossPercent)
shortTake = strategy.position_avg_price * (1 - takeProfitPercent)
longTake = strategy.position_avg_price * (1 + takeProfitPercent)
minimumProfitLong = src * (1 + minimumProfit)
minimumProfitShort = src * (1 - minimumProfit)
entryPrice = valuewhen(strategy.opentrades == 1, strategy.position_avg_price, 0)

// TODO : Trouver une facon de ne pas passer d'ordre si c'est dans un range

if (time_condition)
    // Take Profit and Stop Loss
    strategy.entry("LONG", strategy.long, when=longSignal, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
    strategy.entry("SHORT", strategy.short, when=shortSignal, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
     
    // Take Profit and Stop Loss orders
    if strategy.position_size > 0  
        strategy.exit(id = "Close Long", stop=longStop, limit=longTake, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
        // strategy.close_all(when = src > entryPrice, comment = "Close Long by Short signal - " + tostring(src), alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")

    if strategy.position_size < 0
        strategy.exit(id="Close Short", stop=shortStop, limit=shortTake, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
        // strategy.close_all(when = src > entryPrice, comment = "Close Long by Short signal - " + tostring(src), alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
