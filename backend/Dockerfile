FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj files and restore dependencies
COPY src/Domain/Domain.csproj ./src/Domain/
COPY src/Shared/Shared.csproj ./src/Shared/
COPY src/Application/Application.csproj ./src/Application/
COPY src/Infrastructure/Infrastructure.csproj ./src/Infrastructure/
COPY src/Api/Api.csproj ./src/Api/

RUN dotnet restore src/Api/Api.csproj

# Copy src files and build
COPY src/ ./src/

RUN dotnet publish src/Api/Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SistemaGranja.Api.dll"]
