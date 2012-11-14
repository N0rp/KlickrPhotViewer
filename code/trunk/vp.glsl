uniform sampler2D depth;

float getdepth(vec2 tc)
{
    return texture2D(depth, tc).r*10.0;
}

bool filter(vec2 texcoord)
{
    const float dx = 1.0/640.0;
    const float dy = 1.0/480.0;
    float df = getdepth(texcoord);

    if (df == 0.0) 
        return true;

    int c = 0;
    float m = 0.1;

    for (int i=-1; i<2; ++i)
    for (int j=-1; j<2; ++j)
    {
        vec2 t;
        t.x = texcoord.x + (dx*float(i));
        t.y = texcoord.y + (dy*float(j));
        
        if (abs(df - getdepth(t)) < m) 
            c++;
    }

    return (c < 8);
}

void main()
{
    gl_TexCoord[0] = gl_MultiTexCoord0;
    vec2 tc = gl_TexCoord[0].st;

    float d = getdepth(tc);

    vec3 ray = -gl_Normal.xyz;
    vec4 pos = gl_Vertex;

    if (filter(tc))
        d = 1.0;

    pos.xyz = normalize(ray) * d + gl_Vertex.xyz;
    
    gl_Position = gl_ModelViewProjectionMatrix * pos;
}
