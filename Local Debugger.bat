@echo off
title ARRIVALDebugger
del "C:\Users\Eli\ARRIVALTEST\mongo\db\mongod.lock"

start C:\Users\Eli\ARRIVALTEST\mongo\bin\mongod --dbpath "C:\Users\Eli\ARRIVALTEST\mongo\db"
cd C:\Users\Eli\ARRIVAL\ARRIVAL
start heroku local web
