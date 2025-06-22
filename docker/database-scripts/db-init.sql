USE [master]
GO

IF DB_ID('wise-geoguessr') IS NOT NULL
BEGIN
  DROP DATABASE [wise-geoguessr];
END
GO

CREATE DATABASE [wise-geoguessr]
GO

USE [wise-geoguessr]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
