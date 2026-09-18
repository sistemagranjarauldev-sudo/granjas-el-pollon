FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY backend/SistemaGranja.sln ./backend/
COPY backend/src/Domain/Domain.csproj ./backend/src/Domain/
COPY backend/src/Shared/Shared.csproj ./backend/src/Shared/
COPY backend/src/Application/Application.csproj ./backend/src/Application/
COPY backend/src/Infrastructure/Infrastructure.csproj ./backend/src/Infrastructure/
COPY backend/src/Api/Api.csproj ./backend/src/Api/

RUN dotnet restore ./backend/SistemaGranja.sln

COPY backend/ ./backend/

RUN dotnet publish ./backend/src/Api/Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SistemaGranja.Api.dll"]
