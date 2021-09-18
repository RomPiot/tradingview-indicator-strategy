//@version=4
strategy(title="Speed & Slow EMA", shorttitle="S&S EMA", overlay=false, initial_capital=1000, format=format.price, currency=currency.USD, default_qty_type=strategy.percent_of_equity, default_qty_value=100)

fromDay = input(title="Jour", defval=1, group="Date de début", inline="date_start")
fromMonth = input(title="Mois", defval=1, group="Date de début", inline="date_start")
fromYear = input(title="Année", defval=2021, group="Date de début", inline="date_start")
toDay = input(title="Jour", defval=31, group="Date de fin", inline="date_end")
toMonth = input(title="Mois", defval=12, group="Date de fin", inline="date_end")
toYear = input(title="Année", defval=2021, group="Date de fin", inline="date_end")

stopLossPercent = input(title="Stop Loss (%)", type=input.integer, minval=0, step=1, defval=5, group="SL & TP", inline="sl_tp") / 100
takeProfitPercent = input(title="Take Profit (%)", type=input.integer, minval=0, step=1, defval=25, group="SL & TP", inline="sl_tp") / 100

// Getting inputs
fast_length = input(title="Fast Length", type=input.integer, defval=1, group="Configuration")
slow_length = input(title="Slow Length", type=input.integer, defval=20, group="Configuration")
// src = input(title="Source", type=input.source, defval=close, group="Configuration") 
macd_length = input(title="Taille du MACD", type=input.integer, minval=1, maxval=50, defval=9, group="Configuration")
// sma_source = input(title="Oscillator MA Type", type=input.string, defval="EMA", options=["SMA", "EMA"], group="Configuration")
// sma_signal = input(title = "Signal Line MA Type", type=input.string, defval="EMA", options=["SMA", "EMA"], group="Configuration")
trendline_ema_length = input(title="Taille de tendance de l'EMA ", type=input.integer, minval=1, maxval=1000, defval=100, group="Configuration")


// fast_length = 1
src = close
// macd_length = 9
sma_source = "EMA"
sma_signal = "EMA"

// Plot colors
col_macd = input(#5BFC0E, "MACD Line", input.color, group="Color Settings", inline="MACD")
col_signal = input(#FF110B, "Signal Line", input.color, group="Color Settings", inline="Signal")
// col_trendline_ema = input(#FBFB04, "TrendLine EMA ", input.color, group="Color Settings")
col_grow_above = input(#26A69A, "Above   Grow", input.color, group="Histogram", inline="Above")
col_fall_above = input(#B2DFDB, "Fall", input.color, group="Histogram", inline="Above")
col_grow_below = input(#FFCDD2, "Below Grow", input.color, group="Histogram", inline="Below")
col_fall_below = input(#FF5252, "Fall", input.color, group="Histogram", inline="Below")

// Dates 
startDate = timestamp(fromYear, fromMonth, fromDay, 00, 00)
endDate = timestamp(toYear, toMonth, toDay, 00, 00)
time_condition = time >= startDate and time <= endDate

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
longSignal = crossover(fast_ma, slow_ma)
shortSignal = crossunder(fast_ma, slow_ma)

// Determine where you've entered and in what direction
longStop = strategy.position_avg_price * (1 - stopLossPercent)
shortStop = strategy.position_avg_price * (1 + stopLossPercent)
shortTake = strategy.position_avg_price * (1 - takeProfitPercent)
longTake = strategy.position_avg_price * (1 + takeProfitPercent)
entryPrice = valuewhen(strategy.opentrades == 1, strategy.position_avg_price, 0)
    
if (time_condition)

    if (src > trendline_ema)
        strategy.entry("LONG - " + tostring(src), strategy.long, when=longSignal, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
        
    if (src < trendline_ema)
        strategy.entry("SHORT - " + tostring(src), strategy.short, when=shortSignal, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
        
       
// if order is long
if strategy.position_size > 0
    // close order only if close_price_candle > price_order_long
    strategy.close_all(when = src > entryPrice, comment = "Close Long by Short signal - " + tostring(src), alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
    strategy.close_all(when = src < trendline_ema, comment = "Close Long by Trendline - " + tostring(src), alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
          
       
    // Take Profit and Stop Loss orders
    strategy.exit(id = "Close Long - " + tostring(src), stop=longStop, limit=longTake, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
       

// if order is short
if strategy.position_size < 0
    // close order only if close_price_candle < price_order_short
    strategy.close_all(when = src < entryPrice, comment = "Close Short by Long signal - " + tostring(src), alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
    strategy.close_all(when = src > trendline_ema, comment = "Close Short by Trendline - " + tostring(src), alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
          
       
    // Take Profit and Stop Loss orders
    strategy.exit(id = "Close Short - " + tostring(src), stop=shortStop, limit=shortTake, alert_message="{{strategy.order.action}} au prix de {{strategy.order.price}} effectué sur {{ticker}}.")
       