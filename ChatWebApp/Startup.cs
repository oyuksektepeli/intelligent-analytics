using Microsoft.Owin;
using Owin;
using Owin.WebSocket.Extensions;

[assembly: OwinStartupAttribute(typeof(ChatWebApp.Startup))]
namespace ChatWebApp
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {

            app.MapWebSocketRoute<MyWebSocket>("/ws");

            ConfigureAuth(app);
        }
    }
}
